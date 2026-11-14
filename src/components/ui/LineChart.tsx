import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { Colors, fontSize, radius, spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks";
import { TextType, ThemedText } from "./ThemedText";

export type LineData = {
  /** Rótulo curto exibido no eixo X (ex.: "12"). */
  label: string;
  /** Texto completo exibido no tooltip (usa `label` quando ausente). */
  title?: string;
  /**
   * Valor da linha ativa (sólida). Omitir (ou passar `null`) encerra a linha
   * nesse ponto — ex.: dias futuros de um período em andamento. Só o fim da
   * série pode ficar sem valor: a linha vai do primeiro ponto até o último com
   * valor e o eixo X continua ocupando a largura toda.
   */
  value?: number | null;
  /** Valor da linha de referência (tracejada). Pontos sem referência são omitidos dela. */
  reference?: number;
};

export type LineChartProps = {
  data: LineData[];
  /** Altura da área do gráfico (sem eixo e legenda), em px. */
  height?: number;
  /** Cor da linha ativa. */
  color?: string;
  /** Cor da linha tracejada de referência (padrão: cor de texto secundária). */
  referenceColor?: string;
  formatValue?: (value: number) => string;
  /** Rótulo da linha ativa na legenda. Sem nenhum rótulo, a legenda não aparece. */
  seriesLabel?: string;
  /** Rótulo da linha tracejada na legenda. */
  referenceLabel?: string;
  /** Quantidade máxima de rótulos exibidos no eixo X. */
  xTickCount?: number;
  onPointPress?: (point: LineData, index: number) => void;
};

// Espaçamento interno do plot: a curva não encosta nas bordas.
const PADDING_TOP = spacing.largeExtra;
const PADDING_BOTTOM = spacing.small;
const PADDING_HORIZONTAL = spacing.small;

// Folga acima do maior valor, para a curva não colar no topo.
const HEADROOM = 1.15;

const LINE_WIDTH = 2;
const DASH = 5;
const DOT_RADIUS = 4.5;

const AXIS_LABEL_WIDTH = 48;
const TOOLTIP_OFFSET = spacing.medium;

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const defaultFormat = (n: number) => n.toLocaleString();

type Coords = { x: number; y: number };

// Catmull-Rom convertido para Bézier cúbica: deixa a linha suave como na
// referência, sem precisar de uma lib de gráficos.
const buildSmoothPath = (pts: Coords[]) => {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`;
  }
  return d;
};

export const LineChart = ({
  data,
  height = 160,
  color = Colors.blue,
  referenceColor,
  formatValue = defaultFormat,
  seriesLabel,
  referenceLabel,
  xTickCount = 5,
  onPointPress,
}: LineChartProps) => {
  const textColor = useThemeColor("text");
  const mutedColor = useThemeColor("caption");
  const tooltipBackground = useThemeColor("backgroundAccent");
  const borderColor = useThemeColor("border");

  // Ids de gradiente não podem repetir quando há mais de um gráfico na tela.
  const gradientId = `line-gradient-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const dashedColor = referenceColor ?? mutedColor;

  const [width, setWidth] = useState(0);
  const [rawSelected, setRawSelected] = useState<number | null>(null);
  // Conteúdo do tooltip: troca no meio do fade, como no DonutChart.
  const [shown, setShown] = useState<number | null>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  const points = useMemo(
    () =>
      data.map((point) => ({
        label: point.label,
        title: point.title ?? point.label,
        // Pontos sem valor (ex.: dias futuros) ficam fora da linha; o 0 é só
        // para manter as contas numéricas.
        value: Math.max(0, point.value ?? 0),
        hasValue: point.value !== undefined && point.value !== null,
        reference:
          point.reference === undefined
            ? undefined
            : Math.max(0, point.reference),
      })),
    [data],
  );

  // A linha vai do começo até o último ponto com valor: valores ausentes só
  // existem no fim da série (ex.: dias futuros de um período em andamento).
  const drawCount = useMemo(() => {
    const index = points.findIndex((point) => !point.hasValue);
    return index === -1 ? points.length : index;
  }, [points]);

  const plotBottom = height - PADDING_BOTTOM;
  const plotWidth = Math.max(0, width - PADDING_HORIZONTAL * 2);
  const plotHeight = Math.max(0, plotBottom - PADDING_TOP);
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  // X de cada índice independe de o ponto ter valor: assim o eixo continua
  // ocupando a largura toda mesmo quando a linha termina antes do fim.
  const xAt = useCallback(
    (index: number) =>
      points.length > 1 ? PADDING_HORIZONTAL + index * step : width / 2,
    [points.length, step, width],
  );

  const domainTop = useMemo(() => {
    let max = 0;
    for (const point of points) {
      max = Math.max(max, point.value, point.reference ?? 0);
    }
    return max > 0 ? max * HEADROOM : 1;
  }, [points]);

  const toY = useCallback(
    (value: number) =>
      plotBottom - (Math.min(value, domainTop) / domainTop) * plotHeight,
    [plotBottom, domainTop, plotHeight],
  );

  // Coordenadas da linha ativa: do primeiro ponto até o último com valor.
  const coords = useMemo<Coords[]>(() => {
    if (width === 0) return [];
    const result: Coords[] = [];
    for (let index = 0; index < drawCount; index++) {
      result.push({ x: xAt(index), y: toY(points[index].value) });
    }
    return result;
  }, [drawCount, points, toY, xAt, width]);

  const referenceCoords = useMemo<Coords[]>(() => {
    const result: Coords[] = [];
    points.forEach((point, index) => {
      if (point.reference === undefined) return;
      result.push({ x: xAt(index), y: toY(point.reference) });
    });
    return result;
  }, [points, toY, xAt]);

  const linePath = useMemo(() => buildSmoothPath(coords), [coords]);
  const referencePath = useMemo(
    () => buildSmoothPath(referenceCoords),
    [referenceCoords],
  );

  const areaPath = useMemo(() => {
    if (coords.length === 0 || !linePath) return "";
    const first = coords[0];
    const last = coords[coords.length - 1];
    return `${linePath} L ${last.x} ${plotBottom} L ${first.x} ${plotBottom} Z`;
  }, [coords, linePath, plotBottom]);

  const ticks = useMemo(() => {
    if (width === 0 || points.length === 0) return [];
    const count = Math.min(xTickCount, points.length);
    if (count <= 1) {
      return [{ index: 0, x: xAt(0), label: points[0].label }];
    }
    const result: { index: number; x: number; label: string }[] = [];
    for (let i = 0; i < count; i++) {
      const index = Math.round((i * (points.length - 1)) / (count - 1));
      if (result[result.length - 1]?.index === index) continue;
      result.push({ index, x: xAt(index), label: points[index].label });
    }
    return result;
  }, [points, width, xAt, xTickCount]);

  // Derivado em vez de sincronizado: se os dados encolherem, a seleção some.
  const selected =
    rawSelected !== null && rawSelected < drawCount ? rawSelected : null;
  const shownInRange = shown !== null && shown < drawCount ? shown : null;
  const shownPoint = shownInRange !== null ? points[shownInRange] : undefined;
  const shownCoord = shownInRange !== null ? coords[shownInRange] : undefined;

  // Tooltip: some, troca o conteúdo e volta com uma mola.
  const tooltipAnim = useSharedValue(0);

  useEffect(() => {
    if (selected === null) {
      tooltipAnim.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
      return;
    }
    tooltipAnim.value = withTiming(
      0,
      { duration: 90, easing: Easing.in(Easing.quad) },
      (finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setShown, selected);
          tooltipAnim.value = withSpring(1, { damping: 14, stiffness: 200 });
        }
      },
    );
  }, [selected, tooltipAnim]);

  // Marcador do ponto selecionado (linha vertical + bolinha), que desliza
  // entre os pontos em vez de pular.
  const indicatorX = useSharedValue(0);
  const indicatorY = useSharedValue(0);
  const indicatorOpacity = useSharedValue(0);
  const indicatorReady = useRef(false);

  useEffect(() => {
    const target = selected !== null ? coords[selected] : undefined;
    if (!target) {
      indicatorOpacity.value = withTiming(0, { duration: 120 });
      return;
    }
    if (indicatorReady.current) {
      const config = { duration: 220, easing: Easing.out(Easing.cubic) };
      indicatorX.value = withTiming(target.x, config);
      indicatorY.value = withTiming(target.y, config);
    } else {
      indicatorX.value = target.x;
      indicatorY.value = target.y;
      indicatorReady.current = true;
    }
    indicatorOpacity.value = withTiming(1, { duration: 140 });
  }, [selected, coords, indicatorX, indicatorY, indicatorOpacity]);

  const indicatorLineProps = useAnimatedProps(() => ({
    x1: indicatorX.value,
    x2: indicatorX.value,
    y1: indicatorY.value,
    y2: plotBottom,
    opacity: indicatorOpacity.value,
  }));

  const indicatorDotProps = useAnimatedProps(() => ({
    cx: indicatorX.value,
    cy: indicatorY.value,
    opacity: indicatorOpacity.value,
  }));

  const tooltipStyle = useAnimatedStyle(() => ({
    opacity: tooltipAnim.value,
    transform: [{ scale: interpolate(tooltipAnim.value, [0, 1], [0.92, 1]) }],
  }));

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const next = event.nativeEvent.layout.width;
    setWidth((prev) => (Math.abs(prev - next) < 0.5 ? prev : next));
  }, []);

  const handleTooltipLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: w, height: h } = event.nativeEvent.layout;
    setTooltipSize((prev) =>
      prev.width === w && prev.height === h ? prev : { width: w, height: h },
    );
  }, []);

  // Toque escolhe o ponto desenhado mais próximo no eixo X; tocar de novo no
  // mesmo ponto fecha o tooltip (mesmo comportamento do DonutChart).
  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (drawCount === 0) return;
      const { locationX } = event.nativeEvent;
      // Nunca além do último ponto com valor: o tooltip não pode apontar para
      // um trecho onde a linha não existe.
      const index =
        step > 0
          ? Math.min(
              drawCount - 1,
              Math.max(0, Math.round((locationX - PADDING_HORIZONTAL) / step)),
            )
          : 0;

      const next = rawSelected === index ? null : index;
      setRawSelected(next);
      if (next !== null) onPointPress?.(points[next], next);
    },
    [drawCount, points, step, rawSelected, onPointPress],
  );

  if (points.length === 0) return null;

  const tooltipLeft = shownCoord
    ? Math.min(
        Math.max(shownCoord.x - tooltipSize.width / 2, spacing.smallExtra),
        Math.max(
          spacing.smallExtra,
          width - tooltipSize.width - spacing.smallExtra,
        ),
      )
    : 0;
  // Pode ficar negativo (acima do plot) de propósito: o tooltip flutua por
  // cima do gráfico, como na referência.
  const tooltipTop = shownCoord
    ? shownCoord.y - TOOLTIP_OFFSET - tooltipSize.height
    : 0;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <View style={[styles.plot, { height }]}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={color} stopOpacity={0.35} />
                <Stop offset="1" stopColor={color} stopOpacity={0} />
              </LinearGradient>
            </Defs>

            {areaPath !== "" && (
              <Path d={areaPath} fill={`url(#${gradientId})`} />
            )}

            {referencePath !== "" && (
              <Path
                d={referencePath}
                stroke={dashedColor}
                strokeWidth={LINE_WIDTH / 2}
                strokeDasharray={[DASH, DASH]}
                strokeLinecap="round"
                fill="none"
              />
            )}

            {linePath !== "" && (
              <Path
                d={linePath}
                stroke={color}
                strokeWidth={LINE_WIDTH}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}

            <AnimatedLine
              animatedProps={indicatorLineProps}
              stroke={mutedColor}
              strokeWidth={1}
            />
            <AnimatedCircle
              animatedProps={indicatorDotProps}
              r={DOT_RADIUS}
              fill={color}
            />
          </Svg>
        )}

        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={
            shownPoint
              ? `${shownPoint.title}: ${formatValue(shownPoint.value)}`
              : "Gráfico de linhas"
          }
          accessibilityHint="Toque em um ponto para ver os detalhes"
        />
      </View>

      {width > 0 && ticks.length > 0 && (
        <View style={[styles.axis, { width }]}>
          {ticks.map((tick) => (
            <Text
              key={tick.index}
              numberOfLines={1}
              accessible={false}
              aria-hidden
              style={[
                styles.axisLabel,
                {
                  left: Math.min(
                    Math.max(tick.x - AXIS_LABEL_WIDTH / 2, 0),
                    Math.max(0, width - AXIS_LABEL_WIDTH),
                  ),
                  color: mutedColor,
                },
              ]}
            >
              {tick.label}
            </Text>
          ))}
        </View>
      )}

      {shownPoint && (
        <Animated.View
          onLayout={handleTooltipLayout}
          pointerEvents="none"
          style={[
            styles.tooltip,
            {
              left: tooltipLeft,
              top: tooltipTop,
              backgroundColor: tooltipBackground,
              borderColor,
            },
            tooltipStyle,
          ]}
        >
          <ThemedText
            type={TextType.Caption}
            color={mutedColor}
            numberOfLines={1}
          >
            {shownPoint.title}
          </ThemedText>
          <ThemedText
            type={TextType.Headline}
            color={textColor}
            numberOfLines={1}
          >
            {formatValue(shownPoint.value)}
          </ThemedText>
          {shownPoint.reference !== undefined && (
            <View style={styles.tooltipReference}>
              <View
                style={[styles.tooltipDot, { backgroundColor: dashedColor }]}
              />
              <ThemedText
                type={TextType.Caption}
                color={mutedColor}
                numberOfLines={1}
              >
                {formatValue(shownPoint.reference)}
              </ThemedText>
            </View>
          )}
        </Animated.View>
      )}

      {(seriesLabel || referenceLabel) && (
        <View style={styles.legend}>
          {seriesLabel && (
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: color }]} />
              <ThemedText type={TextType.Caption} color={mutedColor}>
                {seriesLabel}
              </ThemedText>
            </View>
          )}
          {referenceLabel && (
            <View style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: dashedColor }]} />
              <ThemedText type={TextType.Caption} color={mutedColor}>
                {referenceLabel}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
  },
  plot: {
    // O tooltip extrapola o plot, então nada de `overflow: hidden` aqui.
    overflow: "visible",
  },
  axis: {
    marginTop: spacing.smallExtra,
    height: fontSize.small * 1.5,
  },
  axisLabel: {
    position: "absolute",
    width: AXIS_LABEL_WIDTH,
    textAlign: "center",
    fontSize: fontSize.small,
    lineHeight: fontSize.small * 1.5,
  },
  tooltip: {
    position: "absolute",
    minWidth: 112,
    paddingVertical: spacing.small,
    paddingHorizontal: spacing.medium,
    borderRadius: radius.medium,
    borderWidth: StyleSheet.hairlineWidth,
    boxShadow: "0px 1px 2px rgba(0, 0, 0, .4)",
  },
  tooltipReference: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.smallExtra,
    marginTop: spacing.smallExtra,
  },
  tooltipDot: {
    width: spacing.small,
    height: spacing.small,
    borderRadius: radius.full,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.medium,
    marginTop: spacing.small,
    paddingHorizontal: spacing.smallExtra,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.small,
  },
  dot: {
    width: spacing.small,
    height: spacing.small,
    borderRadius: radius.full,
  },
});


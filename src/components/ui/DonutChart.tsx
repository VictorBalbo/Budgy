import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
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
import { Colors, radius, spacing } from "@/constants/theme";
import { useThemeColor } from "@/hooks";
import { ThemedText, TextType } from "./ThemedText";

export type DonutData = {
  label: string;
  value: number;
  color?: string;
};

export type DonutChartProps = {
  data: DonutData[];
  /** Largura/altura do gráfico em px. */
  size?: number;
  /** Espessura do anel em px. */
  strokeWidth?: number;
  /** Espaço visível entre um arco e outro, em px. */
  gap?: number;
  /** Paleta usada quando um item não define `color`. */
  colors?: string[];
  formatValue?: (value: number) => string;
  /** Rótulo exibido abaixo do total quando nenhum arco está selecionado. */
  totalLabel?: string;
  textColor?: string;
  mutedColor?: string;
};

const DEFAULT_COLORS = [
  Colors.blue,
  Colors.green,
  Colors.yellow,
  Colors.red,
  Colors.gray,
  Colors.gray2,
];

// Quanto o arco selecionado engrossa (em px).
const ACTIVE_EXTRA = 8;

const AnimatedPath = Animated.createAnimatedComponent(Path);

const defaultFormat = (n: number) => n.toLocaleString();

const buildPath = (c: number, r: number, a0: number, a1: number) => {
  "worklet";
  const x0 = c + r * Math.cos(a0);
  const y0 = c + r * Math.sin(a0);
  const x1 = c + r * Math.cos(a1);
  const y1 = c + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

type SegmentProps = {
  center: number;
  radius: number;
  startAngle: number;
  span: number;
  color: string;
  baseWidth: number;
  gap: number;
  isOnly: boolean;
  selected: boolean;
  anySelected: boolean;
  onPress: () => void;
};

const Segment = ({
  center,
  radius,
  startAngle,
  span,
  color,
  baseWidth,
  gap,
  isOnly,
  selected,
  anySelected,
  onPress,
}: SegmentProps) => {
  const active = useSharedValue(selected ? 1 : 0);
  const dim = useSharedValue(anySelected && !selected ? 1 : 0);

  useEffect(() => {
    const config = { duration: 240, easing: Easing.out(Easing.cubic) };
    active.value = withTiming(selected ? 1 : 0, config);
    dim.value = withTiming(anySelected && !selected ? 1 : 0, config);
  }, [selected, anySelected, active, dim]);

  // Com cap arredondado, cada ponta se estende `width / 2`, então o ângulo
  // removido de cada arco desconta o gap + a largura inteira do traço.
  const animatedProps = useAnimatedProps(() => {
    const width = baseWidth + ACTIVE_EXTRA * active.value;
    const delta = isOnly ? 0 : (gap + width) / radius;

    let a0 = startAngle + delta / 2;
    let a1 = startAngle + span - delta / 2;
    if (a1 < a0) {
      a0 = startAngle + span / 2; // fatia minúscula vira um ponto redondo
      a1 = a0;
    }
    if (isOnly) a1 -= 0.001; // círculo completo precisa de pontos distintos

    return {
      d: buildPath(center, radius, a0, a1),
      strokeWidth: width,
      opacity: 1 - 0.6 * dim.value,
    };
  });

  return (
    <AnimatedPath
      animatedProps={animatedProps}
      stroke={color}
      strokeLinecap="round"
      fill="none"
      onPress={onPress}
    />
  );
};

export const DonutChart = ({
  data,
  size = 240,
  strokeWidth = 28,
  gap = 8,
  colors = DEFAULT_COLORS,
  formatValue = defaultFormat,
  totalLabel = "Total",
}: DonutChartProps) => {
  const textColor = useThemeColor("text");

  const [rawSelected, setRawSelected] = useState<number | null>(null);
  const [shown, setShown] = useState<number | null>(null);

  const items = useMemo(
    () =>
      data.map((d, i) => ({
        label: d.label,
        value: Math.max(0, d.value),
        color: d.color ?? colors[i % colors.length],
      })),
    [data, colors],
  );

  const total = useMemo(
    () => items.reduce((sum, i) => sum + i.value, 0),
    [items],
  );

  const center = size / 2;
  const radius = (size - strokeWidth - ACTIVE_EXTRA) / 2;

  const segments = useMemo(() => {
    const result: {
      index: number;
      color: string;
      startAngle: number;
      span: number;
    }[] = [];
    let acc = 0;
    for (let index = 0; index < items.length; index++) {
      const fraction = total > 0 ? items[index].value / total : 0;
      if (fraction > 0) {
        result.push({
          index,
          color: items[index].color,
          startAngle: -Math.PI / 2 + acc * 2 * Math.PI,
          span: fraction * 2 * Math.PI,
        });
      }
      acc += fraction;
    }
    return result;
  }, [items, total]);

  // Derivado em vez de sincronizado por effect: se os dados mudarem e o item
  // selecionado deixar de existir (ou ficar com valor 0), a seleção some.
  const selected =
    rawSelected !== null &&
    rawSelected < items.length &&
    items[rawSelected].value > 0
      ? rawSelected
      : null;

  // Texto central: some, troca o conteúdo e volta com uma mola.
  const textAnim = useSharedValue(1);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    textAnim.value = withTiming(
      0,
      { duration: 90, easing: Easing.in(Easing.quad) },
      (finished) => {
        "worklet";
        if (finished) {
          scheduleOnRN(setShown, selected);
          textAnim.value = withSpring(1, { damping: 12, stiffness: 180 });
        }
      },
    );
  }, [selected, textAnim]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textAnim.value,
    transform: [{ scale: interpolate(textAnim.value, [0, 1], [0.85, 1]) }],
  }));

  const toggle = useCallback((index: number) => {
    setRawSelected((prev) => (prev === index ? null : index));
  }, []);

  const shownItem = shown !== null ? items[shown] : undefined;
  const centerValue = shownItem ? shownItem.value : total;
  const centerLabel = shownItem ? shownItem.label : totalLabel;
  const innerDiameter = size - 2 * (strokeWidth + ACTIVE_EXTRA) - 8;

  return (
    <View style={styles.container}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {segments.map((s) => (
            <Segment
              key={s.index}
              center={center}
              radius={radius}
              startAngle={s.startAngle}
              span={s.span}
              color={s.color}
              baseWidth={strokeWidth}
              gap={gap}
              isOnly={segments.length === 1}
              selected={selected === s.index}
              anySelected={selected !== null}
              onPress={() => toggle(s.index)}
            />
          ))}
        </Svg>

        <View style={styles.centerWrap} pointerEvents="none">
          <Animated.View
            style={[{ width: innerDiameter, alignItems: "center", }, textStyle]}
          >
            <ThemedText numberOfLines={1} type={TextType.Display}>
              {formatValue(centerValue)}
            </ThemedText>
            <ThemedText numberOfLines={1} type={TextType.Caption}>
              {centerLabel}
            </ThemedText>
          </Animated.View>
        </View>
      </View>

      <View style={styles.legend}>
        {items.map((item, index) => {
          const dimmed = selected !== null && selected !== index;
          return (
            <Pressable
              key={index}
              onPress={() => toggle(index)}
              accessibilityRole="button"
              accessibilityState={{ selected: selected === index }}
              style={[styles.legendItem, { opacity: dimmed ? 0.45 : 1 }]}
            >
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <ThemedText type={TextType.Footnote} color={textColor}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  centerWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: spacing.large,
    paddingHorizontal: spacing.medium,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: spacing.medium,
    marginVertical: spacing.smallExtra,
  },
  dot: {
    width: spacing.medium,
    height: spacing.medium,
    borderRadius: radius.full,
    marginRight: spacing.smallExtra,
  },
});

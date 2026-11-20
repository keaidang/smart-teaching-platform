import * as echarts from "echarts/core";
import {
  RadarChart,
  BarChart,
  LineChart,
  HeatmapChart,
  ScatterChart,
  BoxplotChart,
  PieChart,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  RadarComponent,
  MarkLineComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

echarts.use([
  RadarChart,
  BarChart,
  LineChart,
  HeatmapChart,
  ScatterChart,
  BoxplotChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  RadarComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

export default echarts;
export type { EChartsOption };

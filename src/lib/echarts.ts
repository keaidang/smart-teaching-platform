import * as echarts from "echarts/core";
import {
  RadarChart,
  BarChart,
  LineChart,
  HeatmapChart,
  ScatterChart,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  RadarComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

echarts.use([
  RadarChart,
  BarChart,
  LineChart,
  HeatmapChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  RadarComponent,
  CanvasRenderer,
]);

export default echarts;
export type { EChartsOption };

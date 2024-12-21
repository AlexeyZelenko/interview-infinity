<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as d3 from 'd3';

interface ChartData {
  questionId: number;
  timeTaken: number;  // Изменено с timeSpent на timeTaken
  testId: string;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface ChartProps {
  data: ChartData[];
  width?: number;
  height?: number;
}

const props = defineProps<ChartProps>();
const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<any>(null);

const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const chartWidth = computed(() => (props.width || 800) - margin.left - margin.right);
const chartHeight = computed(() => (props.height || 400) - margin.top - margin.bottom);

const initializeChart = () => {
  console.log('=== Starting chart initialization ===');
  console.log('Initial props.data:', props.data);

  if (!chartContainer.value || !props.data?.length) {
    console.warn('Early return: container or data missing');
    return;
  }

  // Очищаем контейнер
  d3.select(chartContainer.value).selectAll('*').remove();
  console.log('Container cleared');

  // Фильтруем данные, убирая некорректные значения
  const validData = props.data.filter(d => {
    console.log('Checking data point:', d);
    console.log('timeTaken type:', typeof d.timeTaken);
    console.log('timeTaken value:', d.timeTaken);

    return typeof d.timeTaken === 'number' &&
        !isNaN(d.timeTaken) &&
        d.timeTaken > 0;
  });

  console.log('Filtered valid data:', validData);

  if (!validData.length) {
    console.warn('No valid data to display after filtering');
    return;
  }

  // Создаем SVG контейнер
  const svg = d3.select(chartContainer.value)
      .append('svg')
      .attr('width', props.width || 800)
      .attr('height', props.height || 400)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

  // Создаем scales
  const xScale = d3.scaleBand()
      .range([0, chartWidth.value])
      .padding(0.1)
      .domain(validData.map((_, i) => i.toString()));

  const maxTime = d3.max(validData, d => d.timeTaken) || 0;
  const yScale = d3.scaleLinear()
      .range([chartHeight.value, 0])
      .domain([0, maxTime]);

  // Добавляем оси
  svg.append('g')
      .attr('transform', `translate(0,${chartHeight.value})`)
      .call(d3.axisBottom(xScale));

  svg.append('g')
      .call(d3.axisLeft(yScale));

  // Добавляем bars
  svg.selectAll('.bar')
      .data(validData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => xScale(i.toString()) || 0)
      .attr('width', xScale.bandwidth())
      .attr('y', d => {
        const y = yScale(d.timeTaken);
        return isNaN(y) ? 0 : y;
      })
      .attr('height', d => {
        const height = chartHeight.value - (yScale(d.timeTaken) || 0);
        return isNaN(height) ? 0 : Math.max(0, height);
      })
      .attr('fill', d => d.isCorrect ? 'steelblue' : '#ff7675')  // Добавляем разные цвета для правильных/неправильных ответов

  // Добавляем tooltip
  const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'grey')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none');

  // Обработчики событий для tooltip
  svg.selectAll('.bar')
      .on('mouseover', (event, d) => {
        tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        tooltip.html(`
        Время: ${d.timeTaken} сек.<br/>
        ${d.isCorrect ? 'Правильно ✓' : 'Неправильно ✗'}
      `)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
      });

  chart.value = svg;
};

watch(() => props.data, (newData) => {
  console.log('Data changed:', newData);
  if (newData?.length) {
    initializeChart();
  }
}, { deep: true });

onMounted(() => {
  console.log('Component mounted');
  initializeChart();
});

onUnmounted(() => {
  d3.select('body').selectAll('.tooltip').remove();
});
</script>

<template>
  <div ref="chartContainer" class="d3-chart">
    <div v-if="!props.data?.length" class="no-data">
      Нет данных для отображения
    </div>
  </div>
</template>

<style scoped>
.d3-chart {
  width: 100%;
  height: 100%;
  min-height: 400px;
}

.no-data {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
}

:deep(.bar:hover) {
  opacity: 0.8;
}
</style>
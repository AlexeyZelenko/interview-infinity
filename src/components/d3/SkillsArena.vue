<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as d3 from 'd3';

interface SkillData {
  name: string;
  count: number;
}

interface SkillChartProps {
  skills: SkillData[];
  width?: number;
  height?: number;
}

const props = defineProps<SkillChartProps>();
const chartContainer = ref<HTMLElement | null>(null);
const chart = ref<any>(null);

// Вычисляем данные для круговой диаграммы
const pieData = computed(() => {
  if (!props.skills?.length) return [];

  return props.skills.map(skill => ({
    label: skill.name,
    value: skill.count,
    color: getRandomColor() // Присваиваем случайный цвет для каждого скила
  }));
});

// Генерация случайного цвета для скилов
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Инициализация диаграммы
const initializeChart = () => {
  if (!chartContainer.value || !pieData.value.length) return;

  // Очищаем контейнер
  d3.select(chartContainer.value).selectAll('*').remove();

  const width = (props.width || 400) / 1.5;
  const height = (props.height || 400) / 1.5;
  const radius = Math.min(width, height) / 1.9;

  // Создаем SVG контейнер
  const svg = d3.select(chartContainer.value)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

  // Создаем генератор дуг
  const arcGenerator = d3.arc()
      .innerRadius(radius * 0.6) // Делаем пончиком вместо сплошного круга
      .outerRadius(radius * 0.9);

  // Создаем генератор круговой диаграммы
  const pie = d3.pie<any>()
      .value(d => d.value)
      .padAngle(0.02);

  // Создаем tooltip
  const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'pie-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'grey')
      .style('border', '1px solid #ddd')
      .style('padding', '10px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none');

  // Добавляем секции диаграммы
  const arcs = svg.selectAll('path')
      .data(pie(pieData.value))
      .enter()
      .append('path')
      .attr('d', arcGenerator as any)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px')
      .style('transition', 'transform 0.2s')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('transform', 'scale(1.05)');

        const percentage = ((d.data.value / d3.sum(pieData.value.map((d: any) => d.value))) * 100).toFixed(1);

        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
        tooltip.html(`
        ${d.data.label}<br/>
        ${d.data.value} items<br/>
        ${percentage}%`
        )
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('transform', 'scale(1)');

        tooltip.transition()
            .duration(500)
            .style('opacity', 0);
      });

  // Добавляем текстовые метки
  const arcLabel = d3.arc()
      .innerRadius(radius * 0.7)
      .outerRadius(radius * 0.7);

  const labels = svg.selectAll('text')
      .data(pie(pieData.value))
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
      .style('fill', 'black')
      .style('font-weight', 'normal')
      .style('padding', '5px')
      .text(d => {
        const percentage = ((d.data.value / d3.sum(pieData.value.map((d: any) => d.value))) * 100).toFixed(0);
        return `${percentage}%`;
      });

  // Добавляем центральный текст
  const total = d3.sum(pieData.value.map((d: any) => d.value));

  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .style('font-size', '24px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .text(`${((total / total) * 100).toFixed(1)}%`);

  svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('dy', '25px')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#666')
      .text('ARENA');

  chart.value = svg;
};

watch(() => props.skills, (newData) => {
  if (newData?.length) {
    initializeChart();
  }
}, { deep: true });

onMounted(() => {
  initializeChart();
});

onUnmounted(() => {
  d3.select('body').selectAll('.pie-tooltip').remove();
});
</script>

<template>
  <div ref="chartContainer" class="d3-pie-chart">
    <div v-if="!props.skills?.length" class="no-data">
      Нет данных для отображения
    </div>
  </div>
</template>

<style scoped>
.d3-pie-chart {
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

.pie-tooltip {
  background-color: grey;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 4px;
  pointer-events: none;
  position: absolute;
  opacity: 0;
}
</style>

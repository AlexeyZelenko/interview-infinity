<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as d3 from 'd3';

interface SkillNode extends d3.SimulationNodeDatum {
  name: string;
  value: number;
  jobs: number;
  tests: number;
  radius: number;
  color: string;
}

const chartContainer = ref<HTMLElement | null>(null);
const tooltip = ref<{ visible: boolean; x: number; y: number; skill: SkillNode | null }>({
  visible: false,
  x: 0,
  y: 0,
  skill: null,
});

const skills: Omit<SkillNode, 'radius' | 'color' | 'x' | 'y'>[] = [
  { name: 'JavaScript', value: 95, jobs: 342, tests: 128 },
  { name: 'TypeScript', value: 88, jobs: 298, tests: 115 },
  { name: 'React', value: 82, jobs: 276, tests: 97 },
  { name: 'Vue.js', value: 70, jobs: 184, tests: 76 },
  { name: 'Node.js', value: 75, jobs: 213, tests: 84 },
  { name: 'Python', value: 90, jobs: 321, tests: 142 },
  { name: 'Java', value: 72, jobs: 198, tests: 88 },
  { name: 'Go', value: 55, jobs: 124, tests: 52 },
  { name: 'Rust', value: 40, jobs: 67, tests: 31 },
  { name: 'Docker', value: 65, jobs: 178, tests: 63 },
  { name: 'AWS', value: 60, jobs: 156, tests: 58 },
  { name: 'SQL', value: 78, jobs: 245, tests: 91 },
  { name: 'GraphQL', value: 45, jobs: 89, tests: 37 },
  { name: 'Kubernetes', value: 50, jobs: 112, tests: 44 },
  { name: 'C#', value: 58, jobs: 143, tests: 55 },
  { name: 'Swift', value: 35, jobs: 54, tests: 22 },
  { name: 'Angular', value: 52, jobs: 118, tests: 48 },
  { name: 'CSS', value: 68, jobs: 167, tests: 71 },
];

const colors = [
  '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd',
  '#818cf8', '#6d28d9', '#7c3aed', '#4f46e5',
  '#4338ca', '#5b21b6', '#7e22ce', '#9333ea',
  '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff',
  '#3b82f6', '#60a5fa',
];

let simulation: d3.Simulation<SkillNode, undefined> | null = null;
let resizeObserver: ResizeObserver | null = null;

const initChart = () => {
  if (!chartContainer.value) return;

  const container = chartContainer.value;
  const width = container.clientWidth;
  const height = container.clientHeight || 400;

  // Clear previous
  d3.select(container).select('svg').remove();

  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  const radiusScale = d3.scaleSqrt()
    .domain([d3.min(skills, d => d.value)!, d3.max(skills, d => d.value)!])
    .range([20, 55]);

  const nodes: SkillNode[] = skills.map((s, i) => ({
    ...s,
    radius: radiusScale(s.value),
    color: colors[i % colors.length],
    x: width / 2 + (Math.random() - 0.5) * 100,
    y: height / 2 + (Math.random() - 0.5) * 100,
  }));

  simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(5))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide<SkillNode>().radius(d => d.radius + 3).strength(0.9))
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05));

  const nodeGroups = svg.selectAll('g')
    .data(nodes)
    .enter()
    .append('g')
    .style('cursor', 'pointer')
    .on('mouseover', (event: MouseEvent, d: SkillNode) => {
      const rect = container.getBoundingClientRect();
      tooltip.value = {
        visible: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top - 10,
        skill: d,
      };
      d3.select(event.currentTarget as Element)
        .select('circle')
        .transition()
        .duration(200)
        .attr('r', d.radius * 1.15)
        .style('filter', 'drop-shadow(0 0 12px rgba(99, 102, 241, 0.5))');
    })
    .on('mousemove', (event: MouseEvent, d: SkillNode) => {
      const rect = container.getBoundingClientRect();
      tooltip.value.x = event.clientX - rect.left;
      tooltip.value.y = event.clientY - rect.top - 10;
    })
    .on('mouseout', (event: MouseEvent, d: SkillNode) => {
      tooltip.value.visible = false;
      d3.select(event.currentTarget as Element)
        .select('circle')
        .transition()
        .duration(200)
        .attr('r', d.radius)
        .style('filter', 'none');
    });

  // Circles
  nodeGroups.append('circle')
    .attr('r', d => d.radius)
    .attr('fill', d => d.color)
    .attr('opacity', 0.8)
    .attr('stroke', 'rgba(255,255,255,0.1)')
    .attr('stroke-width', 1.5);

  // Labels
  nodeGroups.append('text')
    .text(d => d.name)
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .attr('fill', 'white')
    .attr('font-size', d => Math.max(9, d.radius / 3.2) + 'px')
    .attr('font-weight', '500')
    .style('pointer-events', 'none')
    .style('user-select', 'none');

  // Drag behavior
  const drag = d3.drag<SVGGElement, SkillNode>()
    .on('start', (event, d) => {
      if (!event.active) simulation!.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    })
    .on('drag', (event, d) => {
      d.fx = event.x;
      d.fy = event.y;
    })
    .on('end', (event, d) => {
      if (!event.active) simulation!.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    });

  nodeGroups.call(drag);

  simulation.on('tick', () => {
    nodeGroups.attr('transform', d => {
      d.x = Math.max(d.radius, Math.min(width - d.radius, d.x!));
      d.y = Math.max(d.radius, Math.min(height - d.radius, d.y!));
      return `translate(${d.x},${d.y})`;
    });
  });
};

onMounted(async () => {
  await nextTick();
  initChart();

  resizeObserver = new ResizeObserver(() => {
    if (simulation) {
      simulation.stop();
    }
    initChart();
  });

  if (chartContainer.value) {
    resizeObserver.observe(chartContainer.value);
  }
});

onUnmounted(() => {
  if (simulation) simulation.stop();
  if (resizeObserver) resizeObserver.disconnect();
});
</script>

<template>
  <section class="py-16 relative overflow-hidden">
    <div class="max-w-6xl mx-auto px-4">
      <h2 class="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-100">
        {{ $t('skillsChart.title') }}
      </h2>
      <p class="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
        {{ $t('skillsChart.subtitle') }}
      </p>

      <div class="relative" ref="chartContainer" style="height: 450px; width: 100%;">
        <!-- Tooltip -->
        <div
          v-show="tooltip.visible && tooltip.skill"
          class="absolute z-20 pointer-events-none bg-gray-800/95 backdrop-blur-md border border-gray-600/50 rounded-lg px-4 py-3 shadow-xl transition-opacity duration-150"
          :style="{
            left: tooltip.x + 'px',
            top: tooltip.y + 'px',
            transform: 'translate(-50%, -100%)',
          }"
        >
          <template v-if="tooltip.skill">
            <div class="text-gray-100 font-semibold text-sm mb-1">{{ tooltip.skill.name }}</div>
            <div class="text-gray-400 text-xs">
              {{ $t('skillsChart.jobs') }}: <span class="text-indigo-400 font-medium">{{ tooltip.skill.jobs }}</span>
            </div>
            <div class="text-gray-400 text-xs">
              {{ $t('skillsChart.tests') }}: <span class="text-purple-400 font-medium">{{ tooltip.skill.tests }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </section>
</template>

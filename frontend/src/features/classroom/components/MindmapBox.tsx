import React, { useState } from 'react';
import { Icon } from '@iconify/react';

// Example mindmap data structure
type MindmapNode = {
  id: string;
  title: string;
  children?: MindmapNode[];
};

const exampleMindmap: MindmapNode = {
  id: 'root',
  title: 'Lesson Summary',
  children: [
    {
      id: '1',
      title: 'Lesson 1',
      children: [
        { id: '1-1', title: 'Javascript căn bản' },
        { id: '1-2', title: 'ES6' },
      ],
    },
    {
      id: '2',
      title: 'Lesson 2',
      children: [
        { id: '2-1', title: 'ReactJS căn bản' },
        { id: '2-2', title: 'Typescript căn bản' },
      ],
    },
    {
      id: '3',
      title: 'Lesson 3',
    },
  ],
};

interface MindmapNodeProps {
  node: MindmapNode;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  level?: number;
}

const MindmapNodeComponent: React.FC<MindmapNodeProps> = ({ node, expanded, toggle, level = 0 }) => {
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className={`ml-${level === 0 ? 0 : 6} mb-2`}> {/* Indent children */}
      <div
        className={`flex items-center gap-2 p-3 rounded-lg shadow-md bg-gradient-to-r from-blue-100 to-blue-50 dark:from-zinc-800 dark:to-zinc-700 border border-blue-200 dark:border-zinc-600 cursor-pointer transition hover:scale-105 hover:bg-blue-200/80 dark:hover:bg-zinc-600/80`}
        onClick={() => hasChildren && toggle(node.id)}
      >
        {hasChildren && (
          <Icon
            icon={expanded[node.id] ? 'mdi:chevron-down' : 'mdi:chevron-right'}
            className="text-2xl text-blue-500 dark:text-blue-300"
          />
        )}
        <span className="text-xl font-semibold text-blue-900 dark:text-blue-100 select-none">
          {node.title}
        </span>
      </div>
      {hasChildren && expanded[node.id] && (
        <div className="ml-8 mt-1 border-l-2 border-blue-200 dark:border-zinc-600 pl-4">
          {node.children!.map((child) => (
            <MindmapNodeComponent
              key={child.id}
              node={child}
              expanded={expanded}
              toggle={toggle}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MindmapBox: React.FC = () => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ root: true });

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white/80 dark:bg-zinc-900/80 rounded-3xl shadow-2xl border-2 border-primary/10 p-8 mt-8 mb-8 backdrop-blur-xl">
      <h2 className="text-3xl font-bold text-primary mb-6 flex items-center gap-2">
        <Icon icon="mdi:mind-map" className="text-3xl text-blue-500" />
        Mindmap Summary
      </h2>
      <MindmapNodeComponent node={exampleMindmap} expanded={expanded} toggle={toggle} />
      <p className="mt-6 text-zinc-600 dark:text-zinc-300 text-base italic">
        Click on nodes to expand/collapse and explore the lesson summary.
      </p>
    </div>
  );
};

export default MindmapBox;

import React, { useState } from 'react';
import { Header } from './components/Header';
import { ModuleNav } from './components/ModuleNav';
import { Module1Algebra } from './components/modules/Module1Algebra';
import { Module2Slice } from './components/modules/Module2Slice';
import { Module3Group } from './components/modules/Module3Group';
import { Module4JoinsPivot } from './components/modules/Module4JoinsPivot';
import { Module5Cases } from './components/modules/Module5Cases';
import { Module6REngine } from './components/modules/Module6REngine';
import { Module7AIDiagnostics } from './components/modules/Module7AIDiagnostics';
import { Module8Workflow } from './components/modules/Module8Workflow';
import { Module9Export } from './components/modules/Module9Export';
import { Module10Knowledge } from './components/modules/Module10Knowledge';
import { AIDialogDrawer } from './components/AIDialogDrawer';

export default function App() {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* 3-Zone Clean Top Navigation Header */}
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        onOpenAIDialog={() => setIsAIDrawerOpen(true)}
      />

      {/* 10-Module Tab Navigation Bar */}
      <ModuleNav activeModule={activeModule} onSelectModule={setActiveModule} />

      {/* Main Content Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeModule === 1 && <Module1Algebra />}
        {activeModule === 2 && <Module2Slice />}
        {activeModule === 3 && <Module3Group />}
        {activeModule === 4 && <Module4JoinsPivot />}
        {activeModule === 5 && (
          <Module5Cases onNavigateToAIDiagnostics={() => setActiveModule(7)} />
        )}
        {activeModule === 6 && <Module6REngine />}
        {activeModule === 7 && <Module7AIDiagnostics />}
        {activeModule === 8 && (
          <Module8Workflow onNavigateToExport={() => setActiveModule(9)} />
        )}
        {activeModule === 9 && <Module9Export />}
        {activeModule === 10 && <Module10Knowledge />}
      </main>

      {/* Quiet Academic / Engineering Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">DataFrame WebApp 实验室 (R 语言版)</span>
            <span aria-hidden="true">·</span>
            <span>Hadley Wickham Tidyverse 规范体系</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>R 4.x / dplyr 1.1+ / tidyr / ggplot2</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveModule(10)}
              className="hover:text-slate-800 transition-colors"
            >
              数据要素知识导引
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsAIDrawerOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              启动 AI 随诊
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Global AI Q&A Drawer */}
      <AIDialogDrawer isOpen={isAIDrawerOpen} onClose={() => setIsAIDrawerOpen(false)} />
    </div>
  );
}

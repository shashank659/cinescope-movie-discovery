import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkBackendHealth } from '../services/api';
import { Server, CheckCircle2, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { data: health, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['backend-health'],
    queryFn: checkBackendHealth,
  });

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-purple-950/40 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="max-w-2xl">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-3">
            Milestone 1 Complete
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            CineScope Project Initialized
          </h1>
          <p className="mt-3 text-base text-neutral-400 leading-relaxed">
            Full-stack monorepo with React, Vite, Tailwind CSS, TanStack Query, Express, TypeScript, Zod, and Prisma is successfully wired up.
          </p>
        </div>
      </div>

      {/* Backend Health Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <Server className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Backend Health Endpoint</h2>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1.5 rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-750 transition disabled:opacity-50"
              title="Refresh Health Status"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="text-sm">
            {isLoading && (
              <div className="flex items-center space-x-2 text-yellow-400 py-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Checking API health at <code className="text-neutral-300">/api/health</code>...</span>
              </div>
            )}

            {isError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-300 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Cannot reach backend API</p>
                  <p className="text-xs text-red-400 mt-1">{(error as Error)?.message}</p>
                  <p className="text-xs text-neutral-400 mt-2">Ensure the API server is running on port 5000 (<code className="text-neutral-300">npm run dev:api</code>).</p>
                </div>
              </div>
            )}

            {health && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-medium text-xs sm:text-sm">Connected successfully to Express backend</span>
                </div>

                <div className="bg-neutral-950 rounded-lg p-4 font-mono text-xs text-neutral-300 border border-neutral-800/80 space-y-1">
                  <div><span className="text-neutral-500">status:</span> &quot;{health.status}&quot;</div>
                  <div><span className="text-neutral-500">environment:</span> &quot;{health.environment}&quot;</div>
                  <div><span className="text-neutral-500">uptime:</span> {health.uptime} seconds</div>
                  <div><span className="text-neutral-500">timestamp:</span> {health.timestamp}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monorepo Structure Summary */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-2.5 mb-4">
            <Layers className="w-5 h-5 text-pink-400" />
            <h2 className="text-lg font-semibold text-white">Monorepo Packages</h2>
          </div>

          <ul className="space-y-3 text-sm text-neutral-300">
            <li className="flex items-start space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">apps/web</span>
              <span className="text-xs text-neutral-400 leading-snug">React 18 + Vite + Tailwind CSS + React Router + TanStack Query</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">apps/api</span>
              <span className="text-xs text-neutral-400 leading-snug">Express + TypeScript + Zod + Prisma (SQLite)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">packages/shared</span>
              <span className="text-xs text-neutral-400 leading-snug">Shared TypeScript contracts &amp; models</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

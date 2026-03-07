import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/docs',
    component: ComponentCreator('/docs', '896'),
    routes: [
      {
        path: '/docs',
        component: ComponentCreator('/docs', '819'),
        routes: [
          {
            path: '/docs',
            component: ComponentCreator('/docs', '8b7'),
            routes: [
              {
                path: '/docs/data-sources',
                component: ComponentCreator('/docs/data-sources', '682'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/faq',
                component: ComponentCreator('/docs/faq', 'ec8'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/limitations',
                component: ComponentCreator('/docs/limitations', 'a73'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/overview',
                component: ComponentCreator('/docs/overview', 'bdc'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/prompt-cookbook',
                component: ComponentCreator('/docs/prompt-cookbook', '188'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/quickstart',
                component: ComponentCreator('/docs/quickstart', '510'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/reading-reports',
                component: ComponentCreator('/docs/reading-reports', 'f2d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/analyze-token',
                component: ComponentCreator('/docs/tools/analyze-token', 'bc4'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/analyze-wallet',
                component: ComponentCreator('/docs/tools/analyze-wallet', '987'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/compare-tokens',
                component: ComponentCreator('/docs/tools/compare-tokens', 'd19'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/get-token-changes',
                component: ComponentCreator('/docs/tools/get-token-changes', 'fc1'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/scan-risk',
                component: ComponentCreator('/docs/tools/scan-risk', 'a0e'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/docs/tools/watch-token',
                component: ComponentCreator('/docs/tools/watch-token', '91f'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/',
    component: ComponentCreator('/', 'e5f'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];

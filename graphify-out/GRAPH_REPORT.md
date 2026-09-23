# Graph Report - youtube-downloader  (2026-09-22)

## Corpus Check
- Corpus is ~10,947 words - fits in a single context window. You may not need a graph.

## Summary
- 248 nodes · 389 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0 (frontend_src_app, frontend_src_components_downloadbutton, frontend_src_components_downloadbutton_downloadbutton)
- Community 1 (backend_package, backend_package_description, backend_package_json_ref_typescript)
- Community 2 (backend_src_app_app, backend_src_controllers_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_getfile)
- Community 3 (frontend_package, frontend_package_dependencies, frontend_package_dependencies_lucide_react)
- Community 4 (backend_src_controllers_downloadcontroller_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_canceldownload, backend_src_controllers_downloadcontroller_downloadcontroller_getinfo)
- Community 5 (frontend_tsconfig, frontend_tsconfig_compileroptions, frontend_tsconfig_compileroptions_allowimportingtsextensions)
- Community 6 (backend_tsconfig, backend_tsconfig_compileroptions, backend_tsconfig_compileroptions_esmoduleinterop)
- Community 7 (backend_src_services_ytdlpservice_ytdlpservice, backend_src_services_ytdlpservice_ytdlpservice_buildagebypassargs, backend_src_services_ytdlpservice_ytdlpservice_checkdependencies)
- Community 8 (build_graph, graphify_analyze, graphify_build)
- Community 9 (backend_package_devdependencies, backend_package_devdependencies_jest, backend_package_devdependencies_ts_jest)
- Community 10 (frontend_package_devdependencies, frontend_package_devdependencies_autoprefixer, frontend_package_devdependencies_postcss)
- Community 11 (backend_package_dependencies, backend_package_dependencies_cors, backend_package_dependencies_dotenv)
- Community 12 (frontend_src_vite_env_d, frontend_src_vite_env_d_importmeta, frontend_src_vite_env_d_importmetaenv)

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `YtdlpService` - 15 edges
3. `react` - 14 edges
4. `lucide-react` - 12 edges
5. `FileService` - 11 edges
6. `JobManager` - 11 edges
7. `compilerOptions` - 11 edges
8. `DownloadController` - 7 edges
9. `ApiError` - 7 edges
10. `Home()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `ProgressBarProps` --references--> `DownloadJob`  [EXTRACTED]
  frontend/src/components/ProgressBar.tsx → frontend/src/types/index.ts
- `VideoInfoProps` --references--> `VideoInfo`  [EXTRACTED]
  frontend/src/components/VideoInfo.tsx → frontend/src/types/index.ts
- `DownloadHistoryProps` --references--> `DownloadHistoryItem`  [EXTRACTED]
  frontend/src/components/DownloadHistory.tsx → frontend/src/types/index.ts
- `Home()` --calls--> `cancelDownload()`  [EXTRACTED]
  frontend/src/pages/Home.tsx → frontend/src/services/api.ts
- `Home()` --calls--> `getDownloadStatus()`  [EXTRACTED]
  frontend/src/pages/Home.tsx → frontend/src/services/api.ts

## Import Cycles
- None detected.

## Communities (17 total, 6 thin omitted)

### Community 0 - "Community 0 (frontend_src_app, frontend_src_components_downloadbutton, frontend_src_components_downloadbutton_downloadbutton)"
Cohesion: 0.09
Nodes (34): DownloadButton(), DownloadButtonProps, DownloadHistory(), DownloadHistoryProps, ErrorMessage(), ErrorMessageProps, FormatSelector(), FormatSelectorProps (+26 more)

### Community 1 - "Community 1 (backend_package, backend_package_description, backend_package_json_ref_typescript)"
Cohesion: 0.07
Nodes (31): description, typescript, main, name, scripts, build, dev, start (+23 more)

### Community 2 - "Community 2 (backend_src_app_app, backend_src_controllers_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_getfile)"
Cohesion: 0.12
Nodes (15): app, deps, JOB_EXPIRATION_MINUTES, PORT, DOWNLOAD_DIR, FileService, DownloadJob, JobStatus (+7 more)

### Community 3 - "Community 3 (frontend_package, frontend_package_dependencies, frontend_package_dependencies_lucide_react)"
Cohesion: 0.08
Nodes (24): dependencies, lucide-react, react, react-dom, typescript, name, private, scripts (+16 more)

### Community 4 - "Community 4 (backend_src_controllers_downloadcontroller_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_canceldownload, backend_src_controllers_downloadcontroller_downloadcontroller_getinfo)"
Cohesion: 0.20
Nodes (5): DownloadController, JobManager, ALLOWED_HOSTNAMES, UrlValidationResult, validateYouTubeUrl()

### Community 5 - "Community 5 (frontend_tsconfig, frontend_tsconfig_compileroptions, frontend_tsconfig_compileroptions_allowimportingtsextensions)"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+9 more)

### Community 6 - "Community 6 (backend_tsconfig, backend_tsconfig_compileroptions, backend_tsconfig_compileroptions_esmoduleinterop)"
Cohesion: 0.15
Nodes (12): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, resolveJsonModule, rootDir (+4 more)

### Community 8 - "Community 8 (build_graph, graphify_analyze, graphify_build)"
Cohesion: 0.18
Nodes (10): graphify_analyze, graphify_build, graphify_cluster, graphify_detect, graphify_export, graphify_extract, graphify_report, json (+2 more)

### Community 9 - "Community 9 (backend_package_devdependencies, backend_package_devdependencies_jest, backend_package_devdependencies_ts_jest)"
Cohesion: 0.20
Nodes (10): devDependencies, jest, ts-jest, ts-node-dev, @types/cors, @types/express, @types/jest, @types/node (+2 more)

### Community 10 - "Community 10 (frontend_package_devdependencies, frontend_package_devdependencies_autoprefixer, frontend_package_devdependencies_postcss)"
Cohesion: 0.22
Nodes (9): devDependencies, autoprefixer, postcss, tailwindcss, @types/react, @types/react-dom, typescript, vite (+1 more)

### Community 11 - "Community 11 (backend_package_dependencies, backend_package_dependencies_cors, backend_package_dependencies_dotenv)"
Cohesion: 0.33
Nodes (6): dependencies, cors, dotenv, express, express-rate-limit, uuid

## Knowledge Gaps
- **109 isolated node(s):** `name`, `version`, `description`, `main`, `build` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 128 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dotenv` connect `Community 1 (backend_package, backend_package_description, backend_package_json_ref_typescript)` to `Community 2 (backend_src_app_app, backend_src_controllers_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_getfile)`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `react` connect `Community 0 (frontend_src_app, frontend_src_components_downloadbutton, frontend_src_components_downloadbutton_downloadbutton)` to `Community 3 (frontend_package, frontend_package_dependencies, frontend_package_dependencies_lucide_react)`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 9 (backend_package_devdependencies, backend_package_devdependencies_jest, backend_package_devdependencies_ts_jest)` to `Community 1 (backend_package, backend_package_description, backend_package_json_ref_typescript)`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **What connects `name`, `version`, `description` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0 (frontend_src_app, frontend_src_components_downloadbutton, frontend_src_components_downloadbutton_downloadbutton)` be split into smaller, more focused modules?**
  _Cohesion score 0.08897959183673469 - nodes in this community are weakly interconnected._
- **Should `Community 1 (backend_package, backend_package_description, backend_package_json_ref_typescript)` be split into smaller, more focused modules?**
  _Cohesion score 0.07301587301587302 - nodes in this community are weakly interconnected._
- **Should `Community 2 (backend_src_app_app, backend_src_controllers_downloadcontroller, backend_src_controllers_downloadcontroller_downloadcontroller_getfile)` be split into smaller, more focused modules?**
  _Cohesion score 0.11576354679802955 - nodes in this community are weakly interconnected._
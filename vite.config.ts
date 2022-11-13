import { loadEnv } from 'vite'
import type { ConfigEnv, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'
import basicSsl from '@vitejs/plugin-basic-ssl'

// import legacy from '@vitejs/plugin-legacy'
// "@vitejs/plugin-legacy": "^1.8.2",
// import { viteVConsole } from 'vite-plugin-vconsole'
// import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
// export default defineConfig({command, 
export default ({ mode }: ConfigEnv): UserConfigExport => {
  const CWD = process.cwd()
  const { VITE_APP_WEB_URL } = loadEnv(mode, CWD)

  return {
    base: VITE_APP_WEB_URL, // 设置打包路径
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      strictPort: true,
      // host: '10.222.136.250',
      host: '0.0.0.0',
      port: 443,//443
      // host: 'testjianye.hd.xxx.com',
      https: true,
      open: true,
      cors: false,
      // proxy: {
      //   '/api': {
      //     target: VITE_APP_API_URL, // 接口基地址
      //     changeOrigin: true,
      //     secure: true,
      //     rewrite: path => {
      //       console.log(path); // 打印[/api/userInfo] 这就是http-proxy要请求的url,我们基地址实际是没有/api 所以replace掉
      //       return path.replace(/^\/api/, '') + '&debug';
      //     }
      //   }
      // }
    },
    plugins: [
      basicSsl(),
      vue({
        template: {
          // 添加以下内容
          compilerOptions: {
            isCustomElement: tag => tag.startsWith('video-js')
          }
        }
      }),
      // Components({
      //   resolvers: [VantResolver()],
      // }),
      AutoImport({
        resolvers: [ VantResolver()],
        imports: [
          'vue',
          // 'vue-router',
          // 'vue-i18n',
          // '@vueuse/head',
          // '@vueuse/core',
        ],
        dts: 'src/auto-imports.d.ts',
      }),
      // viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 10240,
      //   algorithm: 'gzip',
      //   ext: '.gz'
      // }),
      // legacy({
      //   targets: ['defaults', 'not IE 11'],
      //   additionalLegacyPolyfills: ['regenerator-runtime/runtime']
      // }),
      // viteVConsole({
      //   entry: resolve('src/main.ts'),
      //   localEnabled: command === 'serve',
      //   enabled: command === 'build' && mode === 'test',
      //   config: {
      //     maxLogNumber: 1000,
      //     theme: 'light'
      //   }
      // })
    ],
    // build: {
    //   target: 'es2020',
    //   outDir: 'dist',
    //   assetsDir: 'assets',
    //   chunkSizeWarningLimit: 1000,
    //   cssCodeSplit: true,
    //   sourcemap: false,
    //   rollupOptions: {
    //     output: {
    //       manualChunks(id) {
    //         if (id.includes('node_modules')) {
    //           return id.toString().split('node_modules/')[1].split('/')[0].toString()
    //         }
    //       }
    //     }
    //   },
    //   terserOptions: {
    //     compress: {
    //       drop_console: true, //在打包过程去去除所有的console.log()
    //       drop_debugger: true
    //     }
    //   }
    // },
  }
}

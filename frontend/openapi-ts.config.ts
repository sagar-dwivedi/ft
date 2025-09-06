import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: './openapi.tmp.json',

    output: {
        path: 'src/client',                 // target folder
        clean: true,                        // delete stale files
        format: 'biome',                    // fastest formatter
        lint: 'biome',                      // fastest linter
    },

    plugins: [
        {
            name: 'zod',
            types: { infer: true }
        },
        {
            name: '@tanstack/react-query',
        },
    ],
});
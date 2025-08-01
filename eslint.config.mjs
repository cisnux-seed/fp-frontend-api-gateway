import {dirname} from "path";
import {fileURLToPath} from "url";
import {FlatCompat} from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    ...compat.config({
        rules: {
            "no-console": "off",
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "@next/next/no-img-element": "off",
            'react-hooks/exhaustive-deps': 'off',
            '@next/next/no-page-custom-font': 'off',
        },
    })
];

export default eslintConfig;

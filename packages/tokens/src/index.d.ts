export type ColorScheme = 'light' | 'dark';
export interface ThemeTokensInput {
    colorScheme: ColorScheme;
}
export declare const tokens: {
    readonly light: {
        readonly 'md-sys-color-primary': "var(--md-sys-color-primary)";
        readonly 'md-sys-color-on-primary': "var(--md-sys-color-on-primary)";
        readonly 'md-sys-color-surface': "var(--md-sys-color-surface)";
        readonly 'md-sys-color-on-surface': "var(--md-sys-color-on-surface)";
    };
    readonly dark: {
        readonly 'md-sys-color-primary': "var(--md-sys-color-primary)";
        readonly 'md-sys-color-on-primary': "var(--md-sys-color-on-primary)";
        readonly 'md-sys-color-surface': "var(--md-sys-color-surface)";
        readonly 'md-sys-color-on-surface': "var(--md-sys-color-on-surface)";
    };
};
export declare function injectTokensCssVars(): void;
//# sourceMappingURL=index.d.ts.map
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts", "scripts/**"] },
  {
    rules: {
      // mascot/doodle art is plain SVG served from /public; next/image adds nothing there
      "@next/next/no-img-element": "off",
    },
  },
];

export default config;

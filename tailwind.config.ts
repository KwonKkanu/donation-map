import type { Config } from "tailwindcss";

// Tailwind CSS 설정 파일입니다.
const config: Config = {
  // 어떤 파일들 내부에서 Tailwind CSS 클래스(예: text-blue-600)들을 사용할지 범위를 지정합니다.
  // 여기서는 app 폴더 내부의 모든 React 파일들을 지정했습니다.
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    // 만약 프로젝트 고유의 메인 색상이나 크기를 지정하고 싶다면 extend 안에 추가합니다.
    extend: {}, 
  },
  plugins: [],
};

export default config;

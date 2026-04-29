/**
 * PostCSS 설정 파일
 * CSS를 처리하는 도구로, Tailwind CSS와 호환성 플러그인(Autoprefixer)을 연결해 줍니다.
 */
export default {
  plugins: {
    tailwindcss: {},  // Tailwind 핵심 플러그인
    autoprefixer: {}, // 구형 브라우저에서도 CSS가 잘 작동하도록 도와주는 플러그인
  },
};

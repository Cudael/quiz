const themeInitScript = `(function(){try{var stored=localStorage.getItem('theme');var systemDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var theme=stored==='light'||stored==='dark'||stored==='system'?stored:'system';var resolved=theme==='system'?(systemDark?'dark':'light'):theme;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.style.colorScheme=resolved;}catch(_e){}})();`

export default function Head() {
  return <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
}

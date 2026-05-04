const fs = require('fs');
const path = require('path');

const pagesToFix = ['mulheres', 'homens', 'travestis', 'login', 'favoritos', 'dashboard', 'historico-pagamentos'];

pagesToFix.forEach(page => {
  const legacyHtmlPath = path.join('legacy_html', page + '.html');
  const nextRoutePath = path.join('src', 'app', page, 'page.tsx');
  
  if (fs.existsSync(legacyHtmlPath)) {
    let content = fs.readFileSync(legacyHtmlPath, 'utf8');
    
    // Extrair apenas o que tá dentro do body
    const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    if (bodyMatch) {
      content = bodyMatch[1];
    }
    
    // Remover Modais (Age Gate tem 3 divs de fechamento e Interest Modal tbm)
    content = content.replace(/<div class="age-gate[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
    content = content.replace(/<div class="interest-modal[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
    
    // Remover scripts
    content = content.replace(/<script[\s\S]*?<\/script>/g, '');
    
    // React rules
    content = content.replace(/class=/g, 'className=');
    content = content.replace(/for=/g, 'htmlFor=');
    content = content.replace(/<!--(.*?)-->/g, '{/* $1 */}');
    content = content.replace(/<(img|input|meta|link|hr|br)([^>]*?)(?<!\/)>/ig, '<$1$2 />');
    
    // Inline styles fix
    content = content.replace(/style="height: 45%"/g, 'style={{ height: "45%" }}');
    content = content.replace(/style="height: 72%"/g, 'style={{ height: "72%" }}');
    content = content.replace(/style="height: 58%"/g, 'style={{ height: "58%" }}');
    content = content.replace(/style="height: 86%"/g, 'style={{ height: "86%" }}');
    content = content.replace(/style="height: 38%"/g, 'style={{ height: "38%" }}');
    content = content.replace(/style="height: 52%"/g, 'style={{ height: "52%" }}');
    content = content.replace(/style="height: 76%"/g, 'style={{ height: "76%" }}');
    content = content.replace(/style="height: 68%"/g, 'style={{ height: "68%" }}');
    
    // Links Next.js
    content = content.replace(/href="([^"]+)\.html"/g, 'href="/$1"');
    content = content.replace(/data-target="([^"]+)\.html"/g, 'data-target="/$1"');
    content = content.replace(/href="index\.html"/g, 'href="/"');
    
    // Limpeza de possíveis `</div>` perdidos antes do <header>
    content = content.replace(/^[\s\S]*?(<header)/, '$1');
    
    // Criar componente
    const jsx = `export default function Page() {\n  return (\n    <>\n${content}\n    </>\n  );\n}`;
    
    fs.writeFileSync(nextRoutePath, jsx, 'utf8');
  }
});
console.log('Fixed pages and encoding via JS');

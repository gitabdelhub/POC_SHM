const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const routeAdminRegex = /case 'admin': renderAdmin\(content\); break;/;
const newRouteAdmin = `case 'admin':
                case 'admin-users':
                case 'admin-access':
                case 'admin-dashboards':
                case 'admin-embeddings':
                case 'admin-filters':
                case 'admin-add-dash':
                    renderAdmin(content, hash === 'admin' ? 'admin-add-dash' : hash);
                    break;`;
html = html.replace(routeAdminRegex, newRouteAdmin);
fs.writeFileSync('index.html', html);

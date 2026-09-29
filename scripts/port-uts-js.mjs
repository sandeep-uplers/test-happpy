#!/usr/bin/env node
/**
 * Apply test-happpy conventions to a file copied from UTS resources/js/Talent/.
 * Usage: node scripts/port-uts-js.mjs path/to/file.js [more files...]
 */
import fs from 'node:fs';

const files = process.argv.slice(2);
if (!files.length) {
    console.error('Usage: node scripts/port-uts-js.mjs <files...>');
    process.exit(1);
}

function portContent(src) {
    let s = src;

    if (!/^\s*['"]use client['"];/m.test(s.split('\n').slice(0, 3).join('\n'))) {
        s = `'use client';\n\n${s.replace(/^\uFEFF?/, '')}`;
    }

    s = s.replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]react-router-dom['"];?/g,
        (m, spec) => `import { ${spec.trim()} } from '@/talent/navigation/routerCompat';`,
    );
    s = s.replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]react-router['"];?/g,
        (m, spec) => {
            const cleaned = spec
                .split(',')
                .map((p) => p.trim())
                .filter((p) => p && !/^Outlet$/.test(p.split(/\s+/)[0]))
                .join(', ');
            if (!cleaned) return '';
            return `import { ${cleaned} } from '@/talent/navigation/routerCompat';`;
        },
    );

    s = s.replace(/\buseOutletContext\b/g, 'useJobAgentDashboardContext');
    if (s.includes('useJobAgentDashboardContext') && !s.includes('JobAgentDashboardContext')) {
        s = s.replace(
            /('use client';\n\n)/,
            "$1import { useJobAgentDashboardContext } from '../job-agent/JobAgentDashboardContext';\n",
        );
        s = s.replace(
            /('use client';\n\nimport \{ useJobAgentDashboardContext \} from '\.\.\/job-agent\/JobAgentDashboardContext';\n)(import)/,
            '$2',
        );
    }

    s = s.replace(/import\s+\{[^}]*Helmet[^}]*\}\s+from\s+['"]react-helmet['"];?\n?/g, '');
    s = s.replace(/\{!embedded \? \(\s*<Helmet>[\s\S]*?<\/Helmet>\s*\) : null\}/g, '');
    s = s.replace(/<Helmet>[\s\S]*?<\/Helmet>\s*/g, '');

    if (typeof document !== 'undefined' && document.getElementById('app')) {
        s = s.replace(
            /if \(typeof document !== "undefined" && document\.getElementById\("app"\)\) \{\s*Modal\.setAppElement\("#app"\);\s*\}/,
            "import { ensureModalAppElement } from '../../helpers/setModalAppElement';\nensureModalAppElement();",
        );
    }

    s = s.replace(
        /Modal\.setAppElement\("#app"\);/g,
        'ensureModalAppElement();',
    );

    s = s.replace(/\n{4,}/g, '\n\n\n');

    return s;
}

function fixJobAgentContextImport(s, filePath) {
    if (!s.includes('useJobAgentDashboardContext')) return s;
    const depth = (filePath.match(/\//g) || []).length;
    let rel = '../job-agent/JobAgentDashboardContext';
    if (filePath.includes('/agent-activity/')) {
        rel = '../job-agent/JobAgentDashboardContext';
    } else if (filePath.includes('/happpy-agent/')) {
        rel = '../job-agent/JobAgentDashboardContext';
    } else if (filePath.includes('/components/')) {
        return s;
    }
    if (s.includes("from '../job-agent/JobAgentDashboardContext'") || s.includes('JobAgentDashboardContext')) {
        return s;
    }
    return s.replace(
        "'use client';\n\n",
        `'use client';\n\nimport { useJobAgentDashboardContext } from '${rel}';\n`,
    );
}

for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    let out = portContent(raw);
    out = fixJobAgentContextImport(out, file);
    fs.writeFileSync(file, out);
    console.log('ported', file);
}

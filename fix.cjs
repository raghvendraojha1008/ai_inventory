/**
 * REPAIR SCRIPT: repair_patch_failures.cjs
 * PURPOSE: Fixes the specific failures identified in the previous log.
 * 1. InventoryView: Forces the 'Edit2' import.
 * 2. LedgerView: Forces the closing '</div>' tag for the button group.
 * 3. ReportsView: Forces the Back Button UI and Props.
 */
const fs = require('fs');
const path = require('path');

function repairFile(filePath, taskName, repairFn) {
    const fullPath = path.join(__dirname, filePath);
    if (!fs.existsSync(fullPath)) return console.error(`❌ File not found: ${filePath}`);

    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = repairFn(content);

    if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent);
        console.log(`✅ REPAIRED: ${taskName} in ${filePath}`);
    } else {
        console.log(`✨ SKIPPED: ${taskName} (Already correct or anchor not found)`);
    }
}

console.log("🚀 STARTING REPAIR PROCESS...\n");

// 1. REPAIR INVENTORY VIEW (Missing Import)
repairFile('src/components/views/InventoryView.tsx', 'Import Edit2 Icon', (content) => {
    // If Edit2 is used but not imported
    if (content.includes('<Edit2') && !content.includes('Edit2 } from')) {
        // Find the lucide-react import line and inject Edit2
        return content.replace("from 'lucide-react';", ", Edit2 } from 'lucide-react';");
    }
    return content;
});

// 2. REPAIR LEDGER VIEW (Unclosed Div)
repairFile('src/components/views/LedgerView.tsx', 'Close Flex Container', (content) => {
    // We look for the Trash2 button. If it doesn't have a closing </div> immediately after, we add it.
    // We use a regex to match the button regardless of attributes order
    const trashButtonRegex = /(<Trash2 size=\{14\}\/>\s*<\/button>)(?!<\/div>)/;
    
    if (trashButtonRegex.test(content)) {
        // Append </div> after the button
        return content.replace(trashButtonRegex, '$1</div>');
    }
    return content;
});

// 3. REPAIR REPORTS VIEW (Missing Back Button Logic)
repairFile('src/components/views/ReportsView.tsx', 'Back Button Wiring', (content) => {
    let newContent = content;

    // A. Fix Interface
    if (!newContent.includes('onBack: () => void;')) {
        newContent = newContent.replace(
            /interface ReportsViewProps\s*\{\s*user:\s*User;\s*\}/, 
            'interface ReportsViewProps { user: User; onBack: () => void; }'
        );
    }

    // B. Fix Destructuring
    if (!newContent.includes('({ user, onBack })')) {
        newContent = newContent.replace(
            /const ReportsView:\s*React.FC<ReportsViewProps>\s*=\s*\(\{\s*user\s*\}\)/, 
            'const ReportsView: React.FC<ReportsViewProps> = ({ user, onBack })'
        );
    }

    // C. Fix Button UI (Replace the plain ArrowLeft with a Button)
    // We look for the ArrowLeft icon that ISN'T wrapped in a button
    const plainIconRegex = /(<ArrowLeft size=\{24\}\s*className="[^"]*"\/>)/;
    if (plainIconRegex.test(newContent)) {
        const buttonUI = `<button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-700 dark:text-white"><ArrowLeft size={24}/></button>`;
        newContent = newContent.replace(plainIconRegex, buttonUI);
    }

    return newContent;
});

console.log("\n🚀 REPAIRS COMPLETE. Run 'npm run build' to verify.");
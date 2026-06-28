const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const affStartStr = "      {/* Affiliation & Wallet */}";
// Since I moved Affiliation block right before Danger Zone or Edit Profile Modal...
// Let's just find where Aff is.
const affStartIdx = content.indexOf(affStartStr);

const dzStartStr = "        {/* Danger Zone */}";
const dzStartIdx = content.indexOf(dzStartStr);

// We want Affiliation to be AFTER Danger Zone.
if (affStartIdx !== -1 && dzStartIdx !== -1) {
    if (affStartIdx < dzStartIdx) {
        // Find the end of Affiliation. It might end right before Danger Zone.
        const affBlock = content.substring(affStartIdx, dzStartIdx);
        // Find end of Danger Zone.
        const btnEnd = content.indexOf("          </button>", dzStartIdx);
        const dzEnd = content.indexOf("        </div>", btnEnd) + "        </div>".length;
        
        const dzBlock = content.substring(dzStartIdx, dzEnd) + "\n";
        
        // Construct new content
        const beforeAff = content.substring(0, affStartIdx);
        const afterDz = content.substring(dzEnd);
        
        const finalContent = beforeAff + dzBlock + "\n" + affBlock + afterDz;
        fs.writeFileSync('src/pages/Dashboard.tsx', finalContent);
        console.log("Moved Affiliation AFTER Danger Zone.");
    } else {
        // Affiliation is already after Danger Zone.
        console.log("Affiliation is already after Danger Zone.");
        // Maybe they meant Danger Zone should NOT be last, or should be last?
        // Wait, if it's already after Danger Zone, maybe they noticed Danger Zone is last and shouldn't be?
    }
} else {
    console.log("Could not find aff or dz");
}

const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Find Danger Zone block
const dzStart = content.indexOf("        {/* Danger Zone */}");
const dzBtnEnd = content.indexOf("          </button>", dzStart);
const dzEnd = content.indexOf("        </div>", dzBtnEnd) + "        </div>".length;
const dzBlock = content.substring(dzStart, dzEnd);

// 2. Find Affiliation & Wallet block
const affStart = content.indexOf("      {/* Affiliation & Wallet */}");
const affEndMarker = "              </div>\n            </div>\n          </div>\n        </div>\n      </div>";
const affEndIdx = content.indexOf(affEndMarker, affStart) + affEndMarker.length;
const affBlock = content.substring(affStart, affEndIdx);

// Remove them from current positions
let cleanContent = content;
// To safely remove them, we replace them with empty strings.
// But we must be careful with indices. We will do it sequentially.
// Since we extracted the exact substrings, we can just split and join.
cleanContent = cleanContent.replace(dzBlock, "");
cleanContent = cleanContent.replace(affBlock, "");

// 3. Find the right place to insert them.
// We want to insert them right before:
//       {/* Details Modal */}
const insertTarget = "      {/* Details Modal */}";
const insertPos = cleanContent.indexOf(insertTarget);

if (insertPos !== -1) {
    const finalContent = cleanContent.substring(0, insertPos) +
        dzBlock + "\n\n" +
        affBlock + "\n\n" +
        cleanContent.substring(insertPos);
    
    fs.writeFileSync('src/pages/Dashboard.tsx', finalContent);
    console.log("Successfully moved both blocks to the correct position.");
} else {
    console.log("Could not find insertTarget");
}

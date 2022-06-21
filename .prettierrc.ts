export default {
  plugins: [require("@trivago/prettier-plugin-sort-imports")],
  importOrder: ["<THIRD_PARTY_MODULES>", "^[./]"],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

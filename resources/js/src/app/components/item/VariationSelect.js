import get from "lodash/get";
import { isDefined } from "../../helper/utils";

Vue.component("variation-select", {

    props: {
        template:
        {
            type: String,
            default: "#vue-variation-select"
        },
        itemData:
        {
            type: [Object, null],
            default: null
        }
    },

    data()
    {
        return {
            selectedUnitId: 0
        };
    },

    computed:
    {
        attributes()
        {
            return get(this.currentVariation, "documents[0].data.variationAttributeMap.attributes");
        },

        variations()
        {
            return get(this.currentVariation, "documents[0].data.variationAttributeMap.variations");
        },

        hasEmptyOption()
        {
            // TODO: implementieren!
            return true;
        },

        ...Vuex.mapState({
            currentVariation: state => state.item.variation,
            selectedAttributes: state => state.item.selectedAttributes
        })
    },

    mounted()
    {
        this.$nextTick(() =>
        {
            this.initSelectedAttributes();
        });
    },

    methods:
    {
        filterVariations(selectedAttributes = this.selectedAttributes)
        {
            const result = {};

            for (const variationId in this.variations)
            {
                const variation = this.variations[variationId];
                const hasVariationAttributes = variation && Object.values(variation.attributes).length;
                const isSelectedUnitMatching = this.selectedUnitId === 0 || this.selectedUnitId === variation.unitId;

                if (!hasVariationAttributes || !isSelectedUnitMatching)
                {
                    continue;
                }

                let isValid = true;

                for (const attributeId in variation.attributes)
                {
                    const attributeValue = variation.attributes[attributeId];

                    if (isDefined(selectedAttributes[attributeId]) && selectedAttributes[attributeId] != attributeValue)
                    {
                        isValid = false;
                    }
                }

                if (isValid)
                {
                    result[variationId] = this.variations[variationId];
                }
            }

            return result;
        },

        isEnabled()
        {
            // TODO: implementieren!
            return true;
        },

        isTextCut(name)
        {
            // TODO:
            if (this.$refs.labelBoxRef)
            {
                // textWidth(name, "Custom-Font, Helvetica, Arial, sans-serif") > this.$refs.labelBoxRef[0].clientWidth;
                return true;
            }

            return false;
        },

        initSelectedAttributes()
        {
            let attributes = {};

            for (const attributeId in this.attributes)
            {
                attributes[attributeId] = null;
            }

            // TODO: unitCombination mitbeachten
            const variationAttributes = this.variations[this.currentVariation.documents[0].id].attributes;

            attributes = { ...attributes, ...variationAttributes };

            this.$store.commit("setSelectedAttributes", attributes);
        },

        setVariation(variationId)
        {
            console.log("set variation to id: ", variationId);
        },

        onSelectionChange(attributeKey, attributeValueKey)
        {
            attributeValueKey = attributeValueKey || null;

            this.$store.commit("setSelectedAttribute", { attributeKey, attributeValueKey });

            if (!attributeValueKey)
            {
                const values = Object.values(this.selectedAttributes);
                const uniqueValues = [... new Set(values)];

                if (uniqueValues.length === 1 && !uniqueValues[0])
                {
                    for (const variationId in this.variations)
                    {
                        // TODO: unitCombination mitbeachten
                        const variation = this.variations[variationId];

                        if (!Object.values(variation.attributes).length)
                        {
                            this.setVariation(variationId);
                        }
                    }
                }
            }
            else
            {
                // TODO: else block implementieren

                console.log("else");

                // search variations matching current selection
                const possibleVariations = this.filterVariations();

                console.log("NEW!", possibleVariations);
            }
        }
    }
});

import get from "lodash/get";

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
            const variationAttributes = this.variations[this.currentVariation.documents[0].id][0].attributes;

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
                        // TODO: unitCombination mitbeachten [0]
                        const variation = this.variations[variationId][0];

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
            }
        }
    }
});

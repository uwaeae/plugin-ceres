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
            selectedUnitId: 0,
            possibleUnitIds: []
        };
    },

    computed:
    {
        attributes()
        {
            return get(this.currentVariation, "variationAttributeMap.attributes");
        },

        variations()
        {
            return get(this.currentVariation, "variationAttributeMap.variations");
        },

        hasEmptyOption()
        {
            // TODO: implementieren!
            return true;
        },

        ...Vuex.mapState({
            currentVariation: state => state.item.variation.documents[0].data,
            variationUnitNames: state => state.item.variationUnitNames,
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
                const hasVariationAttributes = variation && Object.keys(variation.attributes).length;
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

        setAttributes(variation)
        {
            let hasChanges = false;

            for (const attributeKey in variation.attributes)
            {
                const val = variation.attributes[attributeKey];

                if (this.selectedAttributes[attributeKey] !== val)
                {
                    this.$store.commit("setSelectedAttribute", { attributeKey, attributeValueKey: val });
                    hasChanges = true;
                }
            }

            return hasChanges;
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

            const preselectedVariation = this.variations[this.currentVariation.variation.id];
            // TODO: unitCombination mitbeachten
            const variationAttributes = preselectedVariation.attributes;

            attributes = { ...attributes, ...variationAttributes };

            this.$store.commit("setSelectedAttributes", attributes);


            /*
            ################################################################################################################################################################
            */

            const unitPreselect = this.currentVariation.variation.unitCombinationId;

            if (Object.keys(preselectedVariation.attributes).length && unitPreselect > 0 || Object.keys(this.attributes).length)
            {
                const possibleVariations = this.filterVariations(this.selectedAttributes);

                if (Object.keys(possibleVariations).length)
                {
                    this.setUnits(possibleVariations);
                }
                else if (Object.keys(possibleVariations).length && Object.keys(this.attributes).length)
                {
                    this.setUnits(this.variations);
                }

                this.selectedUnitId = unitPreselect;
            }
        },

        onSelectionChange(attributeKey, attributeValueKey)
        {
            attributeValueKey = parseInt(attributeValueKey) || null;

            this.$store.commit("setSelectedAttribute", { attributeKey, attributeValueKey });

            if (!attributeValueKey)
            {
                const values = Object.values(this.selectedAttributes);
                const uniqueValues = [... new Set(values)];

                if (uniqueValues.length === 1 && !uniqueValues[0])
                {
                    for (const variationId in this.variations)
                    {
                        const mainVariation = this.variations[variationId];

                        if (!Object.keys(mainVariation.attributes).length)
                        {
                            this.setVariation(variationId);
                        }
                    }
                }
            }
            else
            {
                // search variations matching current selection
                const possibleVariations = this.filterVariations();
                console.log("NEW!", possibleVariations);

                if (Object.keys(possibleVariations).length === 1)
                {
                    if (this.selectedUnitId <= 0)
                    {
                        this.possibleUnitIds = [];
                    }

                    // only 1 matching variation remaining:
                    // set remaining attributes if not set already. Will trigger this method again.
                    if (!this.setAttributes(Object.values(possibleVariations)[0]))
                    {
                        // all attributes are set => load variation data
                        this.setVariation(Object.keys(possibleVariations)[0]);
                    }
                    else
                    {
                        // TODO: testen ob das geht
                        this.onSelectionChange();
                    }
                }
                else if (Object.keys(possibleVariations).length > 1)
                {
                    this.setUnits(possibleVariations);
                }
                else
                {
                    this.setUnits([]);
                }
            }
        },

        setVariation(variationId)
        {
            this.$store.dispatch("loadVariation", variationId).then(variation =>
            {
                document.dispatchEvent(new CustomEvent("onVariationChanged",
                    {
                        detail:
                        {
                            attributes: variation.attributes,
                            documents: variation.documents
                        }
                    }));

                // TODO: SB_single_item:
                this.$emit("is-valid-change", true);
            });
        },

        setUnits(variations)
        {
            console.log("set units");
            let possibleUnitIds = [];

            if (Object.keys(variations).length)
            {
                const values = Object.values(variations).map(variation => variation.unitCombinationId);

                possibleUnitIds = [... new Set(values)];
            }

            if (possibleUnitIds.length)
            {
                this.possibleUnitIds = possibleUnitIds;
            }
            else
            {
                this.selectedUnitId = 0;
            }
        }
    },

    watch:
    {
        currentVariation:
        {
            handler(newVariation, oldVariation)
            {
                if (oldVariation)
                {
                    const url = this.$options.filters.itemURL(newVariation);
                    const title = document.getElementsByTagName("title")[0].innerHTML;

                    window.history.replaceState({}, title, url);
                    document.dispatchEvent(new CustomEvent("onHistoryChanged", { detail: { title: title, url:url } }));
                }
            },
            deep: true
        }
    }
});

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

    computed:
    {
        possibleUnitIds()
        {
            const possibleUnitIds = this.variations.map(variation => variation.unitCombinationId);

            return [...new Set(possibleUnitIds)];
        },

        variationUnitNames()
        {
            const variationUnitNames = {};

            for (const variation of this.variations)
            {
                variationUnitNames[variation.unitCombinationId] = variation.unitName;
            }

            return variationUnitNames;
        },

        hasEmptyOption()
        {
            const hasEmptyVariation = this.variations.some(variation => variation.attributes.length === 0);
            const preselectedVariationExists = !!this.variations.find(variation => variation.variationId == this.preselectedVariationId);

            if (hasEmptyVariation || !preselectedVariationExists)
            {
                // main variation is selectable
                return true;
            }

            // Check if all possible combinations can be selected or if an empty option is required to reset the current selection
            const attributeCombinationCount = this.attributes
                .map(attribute =>
                {
                    return attribute.values.length;
                })
                .reduce((prod, current) =>
                {
                    return prod * current;
                }, 1);

            return (attributeCombinationCount * Object.keys(this.variationUnitNames).length) !== this.variations.length;
        },

        ...Vuex.mapState({
            currentVariation: state => state.item.variation.documents[0].data,
            selectedAttributes: state => state.item.selectedAttributes,
            selectedUnitCombinationId: state => state.item.selectedUnitCombinationId,
            attributes: state => state.item.variationAttributeMap.attributes,
            variations: state => state.item.variationAttributeMap.variations
        })
    },

    data()
    {
        return {
            preselectedVariationId: null
        };
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
        filterVariations(attributes, unitCombinationId = this.selectedUnitCombinationId)
        {
            attributes = attributes || this.selectedAttributes;

            let variations = this.variations.filter(variation =>
            {
                for (const attribute of variation.attributes)
                {
                    const attributeId = attribute.attributeId;
                    const value = attribute.attributeValueId;

                    if (!!attributes[attributeId] && attributes[attributeId] != value)
                    {
                        return false;
                    }
                }

                return variation.attributes.length > 0;
            });

            variations = variations.filter(variation =>
            {
                return this.selectedUnitCombinationId === 0 || unitCombinationId === variation.unitCombinationId;
            });

            return variations;
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

            for (const attribute of this.attributes)
            {
                attributes[attribute.attributeId] = null;
            }

            this.preselectedVariationId = this.currentVariation.variation.id;

            const preselectedVariation = this.variations.find(variation => variation.variationId == this.currentVariation.variation.id);

            for (const attributeId in attributes)
            {
                attributes[attributeId] = preselectedVariation.attributes.find(attribute => attribute.attributeId == attributeId).attributeValueId;
            }

            this.$store.commit("setSelectedAttributes", attributes);

            const unitPreselect = this.currentVariation.variation.unitCombinationId;

            if (this.possibleUnitIds.length > 1)
            {
                this.$store.commit("setSelectedUnitCombinationId", unitPreselect);
            }
        },

        onSelectionChange(attributeId, attributeValueId)
        {
            value = parseInt(value) || null;
            this.$store.commit("setSelectedAttribute", { attributeId, attributeValueId });

            if (!value)
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
                this.handleSelectionChange();
            }
        },

        onUnitSelectionChange(selectedUnitCombinationId)
        {
            selectedUnitCombinationId = parseInt(selectedUnitCombinationId);
            this.$store.commit("setSelectedUnitCombinationId", selectedUnitCombinationId);

            this.handleSelectionChange();
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

        setAttributesForVariation(variation)
        {
            for (const attribute of variation.attributes)
            {
                this.$store.commit("setSelectedAttribute", { attributeId: attribute.attributeId, attributeValueId: attribute.attributeValueId });
            }
            this.$store.commit("setSelectedUnitCombinationId", variation.unitCombinationId);
        },

        selectAttribute(attributeId, attributeValueId)
        {
            attributeValueId = parseInt(attributeValueId) || null;
            this.$store.commit("setSelectedAttribute", { attributeId, attributeValueId });

            this.onAttributeSelected(attributeId, attributeValueId);
        },

        onAttributeSelected(attributeId, attributeValueId)
        {
            const filteredVariations = this.filterVariations();

            if (filteredVariations.length === 0)
            {
                const validVariations = this.variations.filter(variation =>
                {
                    const attribute = variation.attributes.find(attribute =>
                    {
                        return attribute.attributeId === attributeId;
                    });

                    if (!!attribute && attribute.attributeValueId === attributeValueId)
                    {
                        return true;
                    }

                    return false;
                });

                this.correctSelection(validVariations, true);
                this.onAttributeSelected(attributeId, attributeValueId);
            }
            else if (filteredVariations.length === 1)
            {
                this.setAttributesForVariation(filteredVariations[0]);
            }
        },

        selectUnit(unitCombinationId)
        {
            unitCombinationId = parseInt(unitCombinationId) || null;
            this.$store.commit("setSelectedUnitCombinationId", unitCombinationId);

            const filteredVariations = this.filterVariations();

            if (filteredVariations.length === 0)
            {
                const validVariations = this.variations.filter(variation => variation.unitCombinationId === unitCombinationId);

                this.correctSelection(validVariations, false);
            }
        },

        // eslint-disable-next-line complexity
        correctSelection(validVariations, considerUnit = true)
        {
            const validVariationCount = [];

            for (const variation of validVariations)
            {
                let count = 0;

                for (const attribute of variation.attributes)
                {
                    if (!(this.selectedAttributes[attribute.attributeId] === attribute.attributeValueId))
                    {
                        count++;
                    }
                }
                if (considerUnit && variation.unitCombinationId !== this.selectedUnitCombinationId)
                {
                    count++;
                }

                if (count > 0)
                {
                    validVariationCount.push({ variation, count });
                }
            }

            const suggestiveVariation = validVariationCount.reduce((prev, current) => (prev.count < current.count) ? prev : current).variation;

            for (const attribute of suggestiveVariation.attributes)
            {
                if (this.selectedAttributes[attribute.attributeId] !== attribute.attributeValueId)
                {
                    this.$store.commit("setSelectedAttribute", { attributeId: attribute.attributeId, attributeValueId: null });
                }
            }
            if (considerUnit && this.selectedUnitCombinationId !== suggestiveVariation.unitCombinationId)
            {
                this.$store.commit("setSelectedUnitCombinationId", suggestiveVariation.unitCombinationId);
            }
        },

        testEnabled(attributeKey, attributeValueId)
        {
            attributeValueId = parseInt(attributeValueId) || null;
            const attributes = JSON.parse(JSON.stringify(this.selectedAttributes));

            if (this.selectedAttributes[attributeKey] === attributeValueId)
            {
                return true;
            }

            attributes[attributeKey] = attributeValueId;
            return !!this.filterVariations(attributes).length;
        },

        testEnabledByUnit(unitCombinationId)
        {
            unitCombinationId = parseInt(unitCombinationId) || null;

            if (this.selectedUnitCombinationId === unitCombinationId)
            {
                return true;
            }

            return !!this.filterVariations(null, unitCombinationId).length;
        }
    }
});

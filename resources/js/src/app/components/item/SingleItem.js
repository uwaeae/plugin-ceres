import { transformVariationProperties } from "../../services/VariationPropertyService";

Vue.component("single-item", {

    props:
    {
        template:
        {
            type: String,
            default: "#vue-single-item"
        },
        variationAttributeMap:
        {
            type: [Object, null],
            default: null
        }
    },

    jsonDataFields: [
        "itemData"
    ],

    data()
    {
        return {
            isVariationSelected: true
        };
    },

    computed:
    {
        isDescriptionTabActive()
        {
            return App.config.item.itemData.includes("item.description") && !!this.currentVariation.texts.description.length;
        },

        isTechnicalDataTabActive()
        {
            return App.config.item.itemData.includes("item.technical_data") && !!this.currentVariation.texts.technicalData.length;
        },

        transformedVariationProperties()
        {
            return transformVariationProperties(this.currentVariation, ["empty"], "showInItemListing");
        },

        ...Vuex.mapState({
            currentVariation: state => state.item.variation.documents[0].data,
            variations: state => state.item.variationList
        }),

        ...Vuex.mapGetters([
            "variationTotalPrice",
            "variationMissingProperties",
            "variationGroupedProperties",
            "variationGraduatedPrice"
        ])
    },

    created()
    {
        this.$store.commit("setVariation", this.itemData);
        this.$store.commit("setVariationDataCache", this.itemData);
        this.$store.commit("setVariationAttributeMap", this.variationAttributeMap);
        this.$store.dispatch("addLastSeenItem", this.currentVariation.variation.id);
    }
});

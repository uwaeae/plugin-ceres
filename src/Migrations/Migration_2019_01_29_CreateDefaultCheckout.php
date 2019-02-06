<?php

namespace Ceres\Migrations;

use Plenty\Modules\Category\Contracts\CategoryRepositoryContract;
use Plenty\Modules\Category\Models\Category;
use Plenty\Modules\Plugin\PluginSet\Contracts\PluginSetRepositoryContract;
use Plenty\Modules\Plugin\PluginSet\Models\PluginSet;
use Plenty\Modules\ShopBuilder\Contracts\ContentLinkRepositoryContract;
use Plenty\Modules\ShopBuilder\Contracts\ContentRepositoryContract;
use Plenty\Modules\System\Contracts\WebstoreRepositoryContract;

class Migration_2019_01_29_CreateDefaultCheckout
{
    public function run()
    {
        /** @var WebstoreRepositoryContract $webstoreRepository */
        $webstoreRepository = pluginApp( WebstoreRepositoryContract::class );
        $webstores = $webstoreRepository->loadAll();
        
        /** @var CategoryRepositoryContract $categoryRepo */
        $categoryRepo = pluginApp(CategoryRepositoryContract::class);
    
        /** @var ContentRepositoryContract $contentRepo */
        $contentRepo = pluginApp(ContentRepositoryContract::class);
        
        /** @var ContentLinkRepositoryContract $contentLinkRepo */
        $contentLinkRepo = pluginApp(ContentLinkRepositoryContract::class);
        
        $checkoutCategoryDetails = [];
        $clients = [];
        
        if(count($webstores))
        {
            foreach($webstores as $webstore)
            {
                $checkoutCategoryDetails[] = [
                    'plentyId' => $webstore->storeIdentifier,
                    'name'     => 'DefaultCheckout',
                    'lang'     => 'de'
                ];
                
                $checkoutCategoryDetails[] = [
                    'plentyId' => $webstore->storeIdentifier,
                    'name'     => 'DefaultCheckout',
                    'lang'     => 'en'
                ];
                
                $clients[] = [
                    'plentyId' => $webstore->storeIdentifier
                ];
            }
        }
        
        $checkoutCategoryData = [
            'level'   => 0,
	        'type'    => 'content',
	        'details' => $checkoutCategoryDetails,
	  		'clients' => $clients
        ];
        
        $checkoutCategory = $categoryRepo->createCategory($checkoutCategoryData);
        if($checkoutCategory instanceof Category)
        {
            /** @var PluginSetRepositoryContract $pluginSetRepo */
            $pluginSetRepo = pluginApp(PluginSetRepositoryContract::class);
            $pluginSets = $pluginSetRepo->list();
            
            if(count($pluginSets))
            {
                foreach($pluginSets as $pluginSet)
                {
                    if($pluginSet instanceof PluginSet)
                    {
                        $lang = 'de';
                        
                        $contentLinkData = [
                            'containerName' => 'ShopBuilder::Category.'.$checkoutCategory->id,
                            'pluginSetId'   => (int)$pluginSet->id,
                            'language'      => $lang,
                            'active'        => false,
                        ];
                        
                        $content = $contentRepo->createContent($pluginSet->id, ['presetClass' => 'Ceres\\Widgets\\Presets\\DefaultCheckoutPreset', 'dataProviderName' => 'DefaultCheckout', 'link' => $contentLinkData], $lang);
                        
                        $lang = 'en';
                        $contentLinkData['lang'] = $lang;
                        $contentLinkData['contentId'] = $content->id;
                        
                        $contentLinkRepo->createContentLink($contentLinkData);
                    }
                }
            }
        }
    }
}
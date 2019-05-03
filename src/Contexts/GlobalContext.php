<?php

namespace Ceres\Contexts;

use Ceres\Config\CeresConfig;
use Ceres\Contexts\Data\PageMetadata;
use IO\Helper\ArrayHelper;
use IO\Helper\ContextInterface;
use IO\Helper\SerializableContextInterface;
use IO\Services\BasketService;
use IO\Services\CategoryService;
use IO\Services\CheckoutService;
use IO\Services\CustomerService;
use IO\Services\NotificationService;
use IO\Services\SessionStorageService;
use IO\Services\TemplateService;
use IO\Services\UrlService;
use IO\Services\WebstoreConfigurationService;
use Plenty\Modules\ShopBuilder\Helper\ShopBuilderRequest;
use Plenty\Plugin\Http\Request;
use Twig\Template;

class GlobalContext implements SerializableContextInterface
{
    protected $params = [];

    /** @var CeresConfig $ceresConfig  */
    public $ceresConfig = null;

    /** @var Request $request */
    protected $request;

    /** @var PageMetadata */
    public $pageMetadata;

    public $lang;
    public $template = [];
    public $templateName;
    public $categories;
    public $categoryBreadcrumbs;
    public $notifications;
    public $basket;
    public $webstoreConfig;
    public $currencyData;
    public $showNetPrices;
    public $splitItemBundle;
    public $templateEvent;
    public $isShopBuilder;
    public $bodyClasses;


    /** @deprecated use $lang instead */
    public $metaLang;

    /** @deprecated use $pageMetadata instead */
    public $forceNoIndex;

    /** @deprecated use ShopUrl::home instead */
    public $homepageURL;

    public function init($params)
    {
        $this->params = $params;

        /** @var SessionStorageService $sessionStorageService */
        $sessionStorageService = pluginApp(SessionStorageService::class);

        /** @var CategoryService $categoryService */
        $categoryService = pluginApp(CategoryService::class);

        /** @var TemplateService $templateService */
        $templateService = pluginApp(TemplateService::class);

        /** @var WebstoreConfigurationService $webstoreConfigService */
        $webstoreConfigService = pluginApp(WebstoreConfigurationService::class);
        
        /** @var BasketService $basketService */
        $basketService = pluginApp(BasketService::class);

        /** @var CheckoutService $checkoutService */
        $checkoutService = pluginApp(CheckoutService::class);

        /** @var CustomerService $customerService */
        $customerService = pluginApp(CustomerService::class);

        /** @var ShopBuilderRequest $shopBuilderRequest */
        $shopBuilderRequest = pluginApp(ShopBuilderRequest::class);

        $this->ceresConfig = pluginApp(CeresConfig::class);
        $this->webstoreConfig = $webstoreConfigService->getWebstoreConfig();

        $this->request = pluginApp(Request::class);

        $this->lang = $sessionStorageService->getLang();

        $this->homepageURL = pluginApp(UrlService::class)->getHomepageURL();
        $this->metaLang = 'de';
        if($this->lang == 'en')
        {
            $this->metaLang = $this->lang;
        }

        $this->forceNoIndex = $templateService->isNoIndexForced();

        if($templateService->isCategory() || $templateService->isItem())
        {
            $this->categoryBreadcrumbs = $categoryService->getHierarchy(0, false, true);
        }

        $this->categories = $categoryService->getNavigationTree($this->ceresConfig->header->showCategoryTypes, $this->lang, 6, $customerService->getContactClassId());
        $this->notifications = pluginApp(NotificationService::class)->getNotifications();

        $this->basket = $basketService->getBasketForTemplate();

        $this->currencyData = $checkoutService->getCurrencyData();

        $this->showNetPrices = $customerService->showNetPrices();

        $this->splitItemBundle = $webstoreConfigService->getWebstoreConfig()->dontSplitItemBundle;

        $this->templateEvent = $templateService->getCurrentTemplate();

        $this->isShopBuilder = $shopBuilderRequest->isShopBuilder();
       
        $this->bodyClasses = [];
        $templateClass = str_replace('tpl', 'page', $this->templateEvent);
        $templateClass = str_replace('.', '-', $templateClass);

        /* page-item is a bootstrap class */
        if($templateClass === "page-item")
        {
            $templateClass = "page-singleitem";
        }

        $this->bodyClasses[] = $templateClass;

        $this->pageMetadata = pluginApp(PageMetadata::class);
    }

    public function toArray()
    {
        $result = ArrayHelper::toArray($this);
        $result['pageMetadata'] = $this->pageMetadata;
        return $result;
    }

    protected function getParam($key, $defaultValue = null)
    {
        if(is_null($this->params[$key]))
        {
            return $defaultValue;
        }

        return $this->params[$key];
    }
}
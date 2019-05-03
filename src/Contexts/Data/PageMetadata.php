<?php

namespace Ceres\Contexts\Data;

use Ceres\Config\CeresConfig;
use IO\Services\TemplateService;
use IO\Services\UrlService;
use Plenty\Plugin\Application;
use Plenty\Plugin\Translation\Translator;

class PageMetadata
{
    public $title;

    public $description;

    public $robots;

    public $type;

    public $imageUrl;

    public $url;

    /** @var CeresConfig */
    private $ceresConfig;

    /** @var Translator */
    private $translator;

    /** @var TemplateService */
    private $templateService;

    /** @var Application */
    private $app;

    public function __construct(
        CeresConfig $ceresConfig,
        Translator $translator,
        TemplateService $templateService,
        UrlService $urlService,
        Application $app)
    {
        $this->ceresConfig      = $ceresConfig;
        $this->translator       = $translator;
        $this->templateService  = $templateService;
        $this->app              = $app;

        $this->withTitle("")
            ->withRobots("NOINDEX, NOFOLLOW")
            ->withType("article")
            ->withImage($ceresConfig->header->companyLogo)
            ->withUrl($urlService->getCanonicalURL());
    }

    public function withTitle($title, $keepSuffix = true)
    {
        $this->title = $title;
        if ($keepSuffix)
        {
            if (strlen($this->title))
            {
                $this->title .= ' | ';
            }

            $this->title .= $this->translator->trans("Ceres::Template.headerCompanyName");
        }

        return $this;
    }

    public function withRobots($robots)
    {
        if ($this->templateService->isNoIndexForced())
        {
            $this->robots = "NOINDEX";
        }
        else
        {
            $this->robots = $robots;
        }
        return $this;
    }

    public function withType($type)
    {
        $this->type = $type;
        return $this;
    }

    public function withImage($imageUrl)
    {
        if (!preg_match('/^https?:\/\//m', $imageUrl))
        {
            if ( substr($imageUrl, 0, 1) !== '/' )
            {
                $imageUrl = '/' . $imageUrl;
            }

            $imageUrl = $this->app->getUrlPath('Ceres') . $imageUrl;
        }

        $this->imageUrl = $imageUrl;
        return $this;
    }

    public function withUrl($url)
    {
        $this->url = $url;
        return $this;
    }

    public function withDescription($description)
    {
        $this->description = $description;
        return $this;
    }
}
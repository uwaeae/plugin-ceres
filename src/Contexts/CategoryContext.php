<?php

namespace Ceres\Contexts;

use IO\Helper\ContextInterface;
use Plenty\Modules\Category\Models\Category;
use Plenty\Modules\Category\Models\CategoryDetails;

class CategoryContext extends GlobalContext implements ContextInterface
{
    /** @var Category */
    public $category = null;
   
    public $metaRobots;
    
    public function init($params)
    {
        parent::init($params);
        
        $this->category = $params['category'];

        /** @var CategoryDetails $categoryDetails */
        $categoryDetails = $this->category->details[0];

        $this->pageMetadata
            ->withTitle($categoryDetails->metaTitle ? $categoryDetails->metaTitle : $categoryDetails->name )
            ->withDescription( $categoryDetails->metaDescription )
            ->withKeywords( $categoryDetails->metaKeywords )
            ->withRobots( str_replace('_', ', ', $categoryDetails->metaRobots) );
        
        $this->bodyClasses[] = "page-category";
        $this->bodyClasses[] = "category-".$this->category->id;
    }
}
<?php

namespace Ceres\Widgets\Grid;

use Ceres\Widgets\Helper\BaseWidget;

class DynamicGridWidget extends BaseWidget
{
    protected $template = "Ceres::Widgets.Grid.DynamicGridWidget";

    protected function getTemplateData($widgetSettings, $isPreview)
    {
        $columns = [
            ['mobile' => 6],
            ['mobile' => 6]
        ];

        if ( array_key_exists('columns', $widgetSettings) )
        {
            $columns = $widgetSettings['columns'];
        }

        return [
            "columns" => $columns
        ];
    }
}

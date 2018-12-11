/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ViewChild, OnInit } from '@angular/core';
import {
    ProcessListCloudComponent,
    ProcessFilterCloudModel,
    EditProcessFilterCloudComponent,
    ProcessListCloudSortingModel,
    ProcessFiltersCloudComponent
} from '@alfresco/adf-process-services-cloud';

import { ActivatedRoute } from '@angular/router';
import { UserPreferencesService } from '@alfresco/adf-core';

@Component({
    templateUrl: './processes-cloud-demo.component.html',
    styleUrls: ['./processes-cloud-demo.component.scss']
})
export class ProcessesCloudDemoComponent implements OnInit {

    @ViewChild('processCloud')
    processCloud: ProcessListCloudComponent;

    @ViewChild('processFiltersCloud')
    processFiltersCloud: ProcessFiltersCloudComponent;

    applicationName: string = '';
    isFilterLoaded: boolean;

    filterId: string = '';
    sortArray: any = [];
    selectedRow: any;

    editedFilter: ProcessFilterCloudModel;

    constructor(private route: ActivatedRoute,
                private userPreference: UserPreferencesService) {
    }

    ngOnInit() {
        this.isFilterLoaded = false;
        this.route.parent.params.subscribe((params) => {
            this.applicationName = params.applicationName;
        });

        this.route.queryParams.subscribe((params) => {
            this.isFilterLoaded = true;
            this.onFilterChange(params);
            this.filterId = params.id;
        });
    }

    onChangePageSize(event) {
        this.userPreference.paginationSize = event.maxItems;
    }

    onRowClick($event) {
        this.selectedRow = $event;
    }

    onFilterChange(query: any) {
        this.editedFilter = Object.assign({}, query);
        this.sortArray = [new ProcessListCloudSortingModel({ orderBy: this.editedFilter.sort, direction: this.editedFilter.order })];
    }

    onEditActions(event: any) {
        if (event.actionType === EditProcessFilterCloudComponent.ACTION_SAVE) {
            this.save(event.id);
        } else if (event.actionType === EditProcessFilterCloudComponent.ACTION_SAVE_AS) {
            this.saveAs(event.id);
        } else if (event.actionType === EditProcessFilterCloudComponent.ACTION_DELETE) {
            this.deleteFilter();
        }
    }

    saveAs(filterId) {
        this.processFiltersCloud.filterParam = <any> {id : filterId};
        this.processFiltersCloud.getFilters(this.applicationName);
    }

    save(filterId) {
        this.processFiltersCloud.filterParam = <any> {id : filterId};
        this.processFiltersCloud.getFilters(this.applicationName);
    }

    deleteFilter() {
        this.processFiltersCloud.getFilters(this.applicationName);
    }
}

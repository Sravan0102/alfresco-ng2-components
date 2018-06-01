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

// tslint:disable-next-line:adf-file-name
import {
    AfterViewInit,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
    EventEmitter,
    Output
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcessInstanceFilterRepresentation, Pagination, UserProcessInstanceFilterRepresentation } from 'alfresco-js-api';
import {
    FORM_FIELD_VALIDATORS, FormEvent, FormFieldEvent, FormRenderingService, FormService,
    DynamicTableRow, ValidateDynamicTableRowEvent, AppConfigService, PaginationComponent, UserPreferenceValues
} from '@alfresco/adf-core';

import { AnalyticsReportListComponent } from '@alfresco/adf-insights';

import {
    ProcessFiltersComponent,
    ProcessInstance,
    ProcessInstanceDetailsComponent,
    ProcessInstanceListComponent,
    StartProcessInstanceComponent
} from '@alfresco/adf-process-services';
import {
    AppsListComponent,
    FilterRepresentationModel,
    TaskDetailsComponent,
    TaskDetailsEvent,
    TaskFiltersComponent,
    TaskListComponent
} from '@alfresco/adf-process-services';
import { LogService } from '@alfresco/adf-core';
import { AlfrescoApiService, UserPreferencesService } from '@alfresco/adf-core';
import { Subscription } from 'rxjs/Subscription';
import { /*CustomEditorComponent*/ CustomStencil01 } from './custom-editor/custom-editor.component';
import { DemoFieldValidator } from './demo-field-validator';
import { PreviewService } from '../../services/preview.service';
import { Location } from '@angular/common';

const currentProcessIdNew = '__NEW__';
const currentTaskIdNew = '__NEW__';

const TASK_ROUTE = 0;
const PROCESS_ROUTE = 1;
const REPORT_ROUTE = 2;

@Component({
    selector: 'app-process-service',
    templateUrl: './process-service.component.html',
    styleUrls: ['./process-service.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProcessServiceComponent implements AfterViewInit, OnDestroy, OnInit {

    @ViewChild('activitifilter')
    activitifilter: TaskFiltersComponent;

    @ViewChild('processListPagination')
    processListPagination: PaginationComponent;

    @ViewChild('taskListPagination')
    taskListPagination: PaginationComponent;

    @ViewChild('taskList')
    taskList: TaskListComponent;

    @ViewChild('activitiprocessfilter')
    activitiprocessfilter: ProcessFiltersComponent;

    @ViewChild('processList')
    processList: ProcessInstanceListComponent;

    @ViewChild('activitiprocessdetails')
    activitiprocessdetails: ProcessInstanceDetailsComponent;

    @ViewChild('activitidetails')
    activitidetails: TaskDetailsComponent;

    @ViewChild('activitiStartProcess')
    activitiStartProcess: StartProcessInstanceComponent;

    @ViewChild('analyticsreportlist')
    analyticsreportlist: AnalyticsReportListComponent;

    @Input()
    appId: number = null;

    filterSelected: object = null;

    @Output()
    changePageSize: EventEmitter<Pagination> = new EventEmitter();

    selectFirstReport = false;

    private tabs = { tasks: 0, processes: 1, reports: 2 };

    layoutType: string;
    currentTaskId: string;
    currentProcessInstanceId: string;

    taskSchemaColumns: any[] = [];
    taskPage = 0;
    processPage = 0;
    paginationPageSize = 0;
    processSchemaColumns: any[] = [];

    supportedPages: number[];

    defaultProcessDefinitionName: string;
    defaultProcessName: string;

    activeTab: number = this.tabs.tasks; // tasks|processes|reports

    taskFilter: FilterRepresentationModel;
    report: any;
    processFilter: UserProcessInstanceFilterRepresentation;
    sub: Subscription;
    blobFile: any;
    flag = true;

    presetColoum = 'default';

    showTaskTab = true;
    showProcessTab = false;

    fieldValidators = [
        ...FORM_FIELD_VALIDATORS,
        new DemoFieldValidator()
    ];

    constructor(private elementRef: ElementRef,
                private route: ActivatedRoute,
                private router: Router,
                private apiService: AlfrescoApiService,
                private logService: LogService,
                private appConfig: AppConfigService,
                private preview: PreviewService,
                formRenderingService: FormRenderingService,
                formService: FormService,
                private location: Location,
                private preferenceService: UserPreferencesService) {

        this.defaultProcessName = this.appConfig.get<string>('adf-start-process.name');
        this.defaultProcessDefinitionName = this.appConfig.get<string>('adf-start-process.processDefinitionName');

        // Uncomment this line to replace all 'text' field editors with custom component
        // formRenderingService.setComponentTypeResolver('text', () => CustomEditorComponent, true);

        // Uncomment this line to map 'custom_stencil_01' to local editor component
        formRenderingService.setComponentTypeResolver('custom_stencil_01', () => CustomStencil01, true);

        formService.formLoaded.subscribe((e: FormEvent) => {
            this.logService.log(`Form loaded: ${e.form.id}`);
        });

        formService.formFieldValueChanged.subscribe((e: FormFieldEvent) => {
            this.logService.log(`Field value changed. Form: ${e.form.id}, Field: ${e.field.id}, Value: ${e.field.value}`);
        });

        this.preferenceService.select(UserPreferenceValues.PaginationSize).subscribe((pageSize) => {
            this.paginationPageSize = pageSize;
        });

        formService.validateDynamicTableRow.subscribe(
            (validateDynamicTableRowEvent: ValidateDynamicTableRowEvent) => {
                const row: DynamicTableRow = validateDynamicTableRowEvent.row;
                if (row && row.value && row.value.name === 'admin') {
                    validateDynamicTableRowEvent.summary.isValid = false;
                    validateDynamicTableRowEvent.summary.message = 'Sorry, wrong value. You cannot use "admin".';
                    validateDynamicTableRowEvent.preventDefault();
                }
            }
        );

        // Uncomment this block to see form event handling in action
        /*
        formService.formEvents.subscribe((event: Event) => {
            this.logService.log('Event fired:' + event.type);
            this.logService.log('Event Target:' + event.target);
        });
        */
    }

    ngOnInit() {
        if (this.router.url.includes('processes')) {
            this.activeTab = this.tabs.processes;
        }
        this.sub = this.route.params.subscribe(params => {
            const applicationId = params['appId'];

            this.filterSelected = params['filterId'] ? { id: +params['filterId'] } : { index: 0 };

            if (applicationId && applicationId !== '0') {
                this.appId = params['appId'];
            }

            this.taskFilter = null;
            this.currentTaskId = null;
            this.processFilter = null;
            this.currentProcessInstanceId = null;
        });
        this.layoutType = AppsListComponent.LAYOUT_GRID;
        this.supportedPages = this.preferenceService.getDefaultPageSizes();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    onTaskFilterClick(filter: FilterRepresentationModel): void {
        this.applyTaskFilter(filter);
        this.resetTaskPaginationPage();
    }

    resetTaskPaginationPage() {
        this.taskPage = 0;
    }

    onTabChange(event: any): void {
        const index = event.index;
        if (index === TASK_ROUTE) {
            this.showTaskTab = event.index === this.tabs.tasks;
            this.relocateLocationToTask();
        } else if (index === PROCESS_ROUTE) {
            this.showProcessTab =  event.index === this.tabs.processes;
            this.relocateLocationToProcess();
        } else if (index === REPORT_ROUTE) {
            this.relocateLocationToReport();
        }
    }

    onChangePageSize(event: Pagination): void {
        this.preferenceService.paginationSize = event.maxItems;
        this.changePageSize.emit(event);
    }

    onReportClick(event: any): void {
        this.report = event;
    }

    onSuccessTaskFilterList(event: any): void {
        this.applyTaskFilter(this.activitifilter.getCurrentFilter());
    }

    applyTaskFilter(filter: FilterRepresentationModel) {
        this.taskFilter = Object.assign({}, filter);

        if (filter && this.taskList) {
            this.taskList.hasCustomDataSource = false;
        }
        this.relocateLocationToTask();
    }

    onStartTaskSuccess(event: any): void {
        this.activitifilter.selectFilterWithTask(event.id);
        this.currentTaskId = event.id;
    }

    onCancelStartTask() {
        this.currentTaskId = null;
        this.reloadTaskFilters();
    }

    onSuccessTaskList(event: FilterRepresentationModel) {
        this.currentTaskId = this.taskList.getCurrentId();
    }

    onProcessFilterClick(event: UserProcessInstanceFilterRepresentation): void {
        this.processFilter = event;
        this.resetProcessPaginationPage();
        this.relocateLocationToProcess();
    }

    resetProcessPaginationPage() {
        this.processPage = 0;
    }

    onSuccessProcessFilterList(event: ProcessInstanceFilterRepresentation[]): void {
        this.processFilter = this.activitiprocessfilter.getCurrentFilter();
    }

    onSuccessProcessList(event: any): void {
        this.currentProcessInstanceId = this.processList.getCurrentId();
    }

    onTaskRowClick(taskId): void {
        this.currentTaskId = taskId;
    }

    onTaskRowDblClick(event: CustomEvent) {
        const taskId = event.detail.value.obj.id;
        this.currentTaskId = taskId;
    }

    onProcessRowDblClick(event: CustomEvent) {
        const processInstanceId = event.detail.value.obj.id;
        this.currentProcessInstanceId = processInstanceId;
    }

    onProcessRowClick(processInstanceId): void {
        this.currentProcessInstanceId = processInstanceId;
    }

    onEditReport(name: string): void {
        this.analyticsreportlist.reload();
    }

    onReportSaved(reportId): void {
        this.analyticsreportlist.reload(reportId);
    }

    onReportDeleted(): void {
        this.analyticsreportlist.reload();
        this.analyticsreportlist.selectReport(null);
    }

    navigateStartProcess(): void {
        this.currentProcessInstanceId = currentProcessIdNew;
    }

    navigateStartTask(): void {
        this.currentTaskId = currentTaskIdNew;
    }

    onStartProcessInstance(instance: ProcessInstance): void {
        this.currentProcessInstanceId = instance.id;
        this.activitiStartProcess.reset();
        this.activitiprocessfilter.selectRunningFilter();
    }

    onCancelProcessInstance() {
        this.currentProcessInstanceId = null;
        this.reloadProcessFilters();
    }

    isStartProcessMode(): boolean {
        return this.currentProcessInstanceId === currentProcessIdNew;
    }

    isStartTaskMode(): boolean {
        return this.currentTaskId === currentTaskIdNew;
    }

    processCancelled(data: any): void {
        this.currentProcessInstanceId = null;
        this.processList.reload();
    }

    onFormCompleted(form): void {
        this.currentTaskId = null;
        if (this.taskListPagination) {
            this.taskPage = this.taskListPagination.current - 1;
        }
        if (!this.taskList) {
            this.navigateToProcess();
        }
    }

    navigateToProcess(): void {
        this.router.navigate([`/activiti/apps/${this.appId}/processes/`]);
    }

    relocateLocationToProcess(): void {
        this.location.go(`/activiti/apps/${this.appId || 0}/processes/${this.processFilter ? this.processFilter.id : 0}`);
    }

    relocateLocationToTask(): void {
        this.location.go(`/activiti/apps/${this.appId || 0}/tasks/${this.taskFilter.id}`);
    }

    relocateLocationToReport(): void {
        this.location.go(`/activiti/apps/${this.appId || 0}/report/`);
    }

    onContentClick(content: any): void {
        if (content.contentBlob) {
            this.preview.showBlob(content.name, content.contentBlob);
        } else {
            this.preview.showResource(content.sourceId.split(';')[0]);
        }
    }

    onAuditClick(event: any) {
        this.logService.log(event);
    }

    onAuditError(event: any): void {
        this.logService.error('My custom error message' + event);
    }

    onTaskCreated(data: any): void {
        this.currentTaskId = data.parentTaskId;
        this.taskList.reload();
    }

    onTaskDeleted(data: any): void {
        this.taskList.reload();
    }

    ngAfterViewInit() {
        this.loadStencilScriptsInPageFromProcessService();
    }

    loadStencilScriptsInPageFromProcessService() {
        this.apiService.getInstance().activiti.scriptFileApi.getControllers().then(response => {
            if (response) {
                const stencilSript = document.createElement('script');
                stencilSript.type = 'text/javascript';
                stencilSript.text = response;
                this.elementRef.nativeElement.appendChild(stencilSript);
            }
        });
    }

    onShowProcessDiagram(event: any): void {
        this.router.navigate(['/activiti/apps/' + this.appId + '/diagram/' + event.value]);
    }

    onProcessDetailsTaskClick(event: TaskDetailsEvent): void {
        event.preventDefault();
        this.activeTab = this.tabs.tasks;

        const taskId = event.value.id;
        const processTaskDataRow: any = {
            id: taskId,
            name: event.value.name || 'No name',
            created: event.value.created
        };
        this.activitifilter.selectFilter(null);
        if (this.taskList) {
            this.taskList.setCustomDataSource([processTaskDataRow]);
            this.taskList.selectTask(taskId);
        }
        this.currentTaskId = taskId;
    }

    private reloadProcessFilters(): void {
        this.activitiprocessfilter.selectFilter(this.activitiprocessfilter.getCurrentFilter());
    }

    private reloadTaskFilters(): void {
        this.activitifilter.selectFilter(this.activitifilter.getCurrentFilter());
    }

    onRowClick(event): void {
        this.logService.log(event);
    }

    onRowDblClick(event): void {
        this.logService.log(event);
    }

    onAssignTask() {
        this.taskList.reload();
        this.currentTaskId = null;
    }

}

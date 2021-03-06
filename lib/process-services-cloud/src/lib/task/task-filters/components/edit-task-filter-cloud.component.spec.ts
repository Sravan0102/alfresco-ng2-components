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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { By } from '@angular/platform-browser';

import { setupTestBed } from '@alfresco/adf-core';
import { MatDialog } from '@angular/material';
import { of } from 'rxjs';

import { ProcessServiceCloudTestingModule } from '../../../testing/process-service-cloud.testing.module';
import { AppsProcessCloudService } from '../../../app/services/apps-process-cloud.service';
import { fakeApplicationInstance } from '../../../app/mock/app-model.mock';
import { TaskFilterCloudModel } from '../models/filter-cloud.model';
import { TaskFiltersCloudModule } from '../task-filters-cloud.module';
import { EditTaskFilterCloudComponent } from './edit-task-filter-cloud.component';
import { TaskFilterCloudService } from '../services/task-filter-cloud.service';
import { TaskFilterDialogCloudComponent } from './task-filter-dialog-cloud.component';

describe('EditTaskFilterCloudComponent', () => {
    let component: EditTaskFilterCloudComponent;
    let service: TaskFilterCloudService;
    let appsService: AppsProcessCloudService;
    let fixture: ComponentFixture<EditTaskFilterCloudComponent>;
    let dialog: MatDialog;
    let getTaskFilterSpy: jasmine.Spy;
    let getDeployedApplicationsByStatusSpy: jasmine.Spy;

    let fakeFilter = new TaskFilterCloudModel({
        name: 'FakeInvolvedTasks',
        icon: 'adjust',
        id: 10,
        state: 'CREATED',
        appName: 'app-name',
        processDefinitionId: 'process-def-id',
        assignment: 'fake-involved',
        order: 'ASC',
        sort: 'id'
    });

    setupTestBed({
        imports: [ProcessServiceCloudTestingModule, TaskFiltersCloudModule],
        providers: [MatDialog]
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EditTaskFilterCloudComponent);
        component = fixture.componentInstance;
        service = TestBed.get(TaskFilterCloudService);
        appsService = TestBed.get(AppsProcessCloudService);
        dialog = TestBed.get(MatDialog);
        spyOn(dialog, 'open').and.returnValue({ afterClosed() { return of({
            action: TaskFilterDialogCloudComponent.ACTION_SAVE,
            icon: 'icon',
            name: 'fake-name'
        }); }});
        getTaskFilterSpy = spyOn(service, 'getTaskFilterById').and.returnValue(fakeFilter);
        getDeployedApplicationsByStatusSpy = spyOn(appsService, 'getDeployedApplicationsByStatus').and.returnValue(of(fakeApplicationInstance));
    });

    it('should create EditTaskFilterCloudComponent', () => {
        expect(component instanceof EditTaskFilterCloudComponent).toBeTruthy();
    });

    it('should fetch task filter by taskId', async(() => {
        let change = new SimpleChange(undefined, '10', true);
        component.ngOnChanges({ 'id': change });
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(component.taskFilter.name).toEqual('FakeInvolvedTasks');
            expect(component.taskFilter.icon).toEqual('adjust');
            expect(component.taskFilter.state).toEqual('CREATED');
            expect(component.taskFilter.order).toEqual('ASC');
            expect(component.taskFilter.sort).toEqual('id');
        });
    }));

    it('should display filter name as title', () => {
        let change = new SimpleChange(undefined, '10', true);
        component.ngOnChanges({ 'id': change });
        fixture.detectChanges();
        const title = fixture.debugElement.nativeElement.querySelector('#adf-edit-task-filter-title-id');
        const subTitle = fixture.debugElement.nativeElement.querySelector('#adf-edit-task-filter-sub-title-id');
        expect(title).toBeDefined();
        expect(subTitle).toBeDefined();
        expect(title.innerText).toEqual('FakeInvolvedTasks');
        expect(subTitle.innerText.trim()).toEqual('ADF_CLOUD_EDIT_TASK_FILTER.TITLE');
    });

    describe('EditTaskFilter form', () => {

        beforeEach(() => {
            let change = new SimpleChange(undefined, '10', true);
            component.ngOnChanges({ 'id': change });
            fixture.detectChanges();
        });

        it('should defined editTaskFilter form ', () => {
             expect(component.editTaskFilterForm).toBeDefined();
        });

        it('should create editTaskFilter form with default properties', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const stateController = component.editTaskFilterForm.get('state');
                const sortController = component.editTaskFilterForm.get('sort');
                const orderController = component.editTaskFilterForm.get('order');
                const assignmentController = component.editTaskFilterForm.get('assignment');
                expect(component.editTaskFilterForm).toBeDefined();
                expect(stateController).toBeDefined();
                expect(sortController).toBeDefined();
                expect(orderController).toBeDefined();
                expect(assignmentController).toBeDefined();

                expect(stateController.value).toBe('CREATED');
                expect(sortController.value).toBe('id');
                expect(orderController.value).toBe('ASC');
                expect(assignmentController.value).toBe('fake-involved');
            });
        }));

        it('should disable save button if the task filter is not changed', async(() => {
            component.showFilterActions = true;
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-id');
                expect(saveButton.disabled).toBe(true);
            });
        }));

        it('should disable saveAs button if the task filter is not changed', async(() => {
            component.showFilterActions = true;
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-as-id');
                expect(saveButton.disabled).toBe(true);
            });
        }));

        it('should enable delete button by default', async(() => {
            component.showFilterActions = true;
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let deleteButton = fixture.debugElement.nativeElement.querySelector('#adf-delete-id');
                expect(deleteButton.disabled).toBe(false);
            });
        }));

        it('should display current task filter details', async(() => {
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
                expansionPanel.click();
                fixture.detectChanges();
                let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-state"]');
                let assignmentElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-assignment"]');
                let sortElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-sort"]');
                let orderElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-order"]');
                expect(stateElement).toBeDefined();
                expect(assignmentElement).toBeDefined();
                expect(sortElement).toBeDefined();
                expect(orderElement).toBeDefined();
                expect(stateElement.textContent.trim()).toBe('CREATED');
                expect(sortElement.textContent.trim()).toBe('ID');
                expect(orderElement.textContent.trim()).toBe('ASC');
            });
        }));

        it('should display state drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-state"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const statusOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(statusOptions.length).toEqual(7);
            });
        }));

        it('should display sort drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let sortElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-sort"]');
            sortElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const sortOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(sortOptions.length).toEqual(5);
            });
        }));

        it('should display order drop down', async(() => {
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let orderElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-order"]');
            orderElement.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const orderOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
                expect(orderOptions.length).toEqual(2);
            });
        }));

        it('should able to fetch running applications', async(() => {
            component.appName = 'mock-app-name';
            component.filterProperties = ['appName', 'processInstanceId', 'dueBefore'];
            let change = new SimpleChange(undefined, 'mock-task-id', true);
            component.ngOnChanges({ 'id': change });
            const appController = component.editTaskFilterForm.get('appName');
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(appController).toBeDefined();
                expect(appController.value).toBe('mock-app-name' );
                expect(getDeployedApplicationsByStatusSpy).toHaveBeenCalled();
            });
        }));

        it('should able to build a editTaskFilter form with default properties if input is empty', async(() => {
            component.filterProperties = [];
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                const stateController = component.editTaskFilterForm.get('state');
                const sortController = component.editTaskFilterForm.get('sort');
                const orderController = component.editTaskFilterForm.get('order');
                fixture.detectChanges();
                expect(component.taskFilterProperties).toBeDefined();
                expect(component.taskFilterProperties.length).toBe(4);
                expect(component.editTaskFilterForm).toBeDefined();
                expect(stateController).toBeDefined();
                expect(sortController).toBeDefined();
                expect(orderController).toBeDefined();
                expect(stateController.value).toBe('CREATED');
                expect(sortController.value).toBe('id');
                expect(orderController.value).toBe('ASC');
            });
        }));

        it('should able to build a editTaskFilter form with given input properties', async(() => {
            getTaskFilterSpy.and.returnValue({ processInstanceId: 'process-instance-id', dueBefore: 'Fri Jan 04 2019 19:16:32 GMT+0530 (IST)' });
            component.appName = 'mock-app-name';
            component.filterProperties = ['appName', 'processInstanceId', 'dueBefore'];
            let change = new SimpleChange(undefined, 'mock-task-id', true);
            component.ngOnChanges({ 'id': change });
            const appController = component.editTaskFilterForm.get('appName');
            const dueDateController = component.editTaskFilterForm.get('dueBefore');
            const processInsIdController = component.editTaskFilterForm.get('processInstanceId');
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                fixture.detectChanges();
                expect(getDeployedApplicationsByStatusSpy).toHaveBeenCalled();
                expect(component.taskFilterProperties).toBeDefined();
                expect(component.editTaskFilterForm).toBeDefined();
                expect(component.taskFilterProperties.length).toBe(3);
                expect(appController).toBeDefined();
                expect(dueDateController).toBeDefined();
                expect(processInsIdController).toBeDefined();
                expect(appController.value).toBe('mock-app-name');
                expect(processInsIdController.value).toBe('process-instance-id');
            });
        }));
    });

    describe('edit filter actions', () => {

        beforeEach(() => {
            let change = new SimpleChange(undefined, '10', true);
            component.ngOnChanges({ 'id': change });
            component.filterProperties = ['state'];
        });

        it('should emit save event and save the filter on click save button', async(() => {
            component.showFilterActions = true;
            const saveFilterSpy = spyOn(service, 'updateFilter').and.returnValue(fakeFilter);
            let saveSpy: jasmine.Spy = spyOn(component.action, 'emit');
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-sort"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const stateOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
            stateOptions[3].nativeElement.click();
            fixture.detectChanges();
            const saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-id');
            saveButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(saveFilterSpy).toHaveBeenCalled();
                expect(saveSpy).toHaveBeenCalled();
            });
        }));

        it('should emit delete event and delete the filter on click of delete button', async(() => {
            component.showFilterActions = true;
            const deleteFilterSpy = spyOn(service, 'deleteFilter').and.callThrough();
            let deleteSpy: jasmine.Spy = spyOn(component.action, 'emit');
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-sort"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            let deleteButton = fixture.debugElement.nativeElement.querySelector('#adf-delete-id');
            deleteButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(deleteFilterSpy).toHaveBeenCalled();
                expect(deleteSpy).toHaveBeenCalled();
            });
        }));

        it('should emit saveAs event and add filter on click saveAs button', async(() => {
            component.showFilterActions = true;
            const saveAsFilterSpy = spyOn(service, 'addFilter').and.callThrough();
            let saveAsSpy: jasmine.Spy = spyOn(component.action, 'emit');
            fixture.detectChanges();
            let expansionPanel = fixture.debugElement.nativeElement.querySelector('mat-expansion-panel-header');
            expansionPanel.click();
            fixture.detectChanges();
            let stateElement = fixture.debugElement.nativeElement.querySelector('[data-automation-id="adf-cloud-edit-task-property-sort"] .mat-select-trigger');
            stateElement.click();
            fixture.detectChanges();
            const saveButton = fixture.debugElement.nativeElement.querySelector('#adf-save-as-id');
            const stateOptions = fixture.debugElement.queryAll(By.css('.mat-option-text'));
            stateOptions[2].nativeElement.click();
            fixture.detectChanges();
            saveButton.click();
            fixture.detectChanges();
            fixture.whenStable().then(() => {
                expect(saveAsFilterSpy).toHaveBeenCalled();
                expect(saveAsSpy).toHaveBeenCalled();
                expect(dialog.open).toHaveBeenCalled();
            });
        }));
    });
});

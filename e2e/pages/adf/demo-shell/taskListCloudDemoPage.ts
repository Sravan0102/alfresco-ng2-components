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

import { Util } from '../../../util/util';
import { TaskListCloudComponent } from '../process-cloud/taskListCloudComponent';
import { PaginationPage } from '../paginationPage';
import { element, by } from 'protractor';

export class TaskListCloudDemoPage {

    taskListCloudPage: TaskListCloudComponent = new TaskListCloudComponent();
    appName = element(by.css("input[data-automation-id='appName-input']"));
    itemsPerPage = element(by.css("input[data-automation-id='items per page']"));
    itemsPerPageForm = element(by.css("mat-form-field[data-automation-id='items per page']"));
    assignee = element(by.css("input[data-automation-id='assignee']"));
    processDefinitionId = element(by.css("input[data-automation-id='process-definition-id']"));
    processInstanceId = element(by.css("input[data-automation-id='process-instance-id']"));
    page = element(by.css("input[data-automation-id='page']"));
    pageForm = element(by.css("mat-form-field[data-automation-id='page']"));
    taskName = element(by.css("input[data-automation-id='task-name']"));
    resetButton = element(by.css("div[class='adf-reset-button'] button"));
    dueBefore = element(by.css("input[data-automation-id='due before']"));
    dueAfter = element(by.css("input[data-automation-id='due after']"));
    currentDate = element(by.css("input[data-automation-id='created-date']"));
    taskId = element(by.css("input[data-automation-id='task-id']"));
    modeDropDownArrow = element(by.css("mat-form-field[data-automation-id='mode'] div[class*='arrow']"));
    modeSelector = element(by.css("div[class*='mat-select-panel']"));

    taskListCloud(): TaskListCloudComponent {
        return this.taskListCloudPage;
    }

    paginationPage() {
        return new PaginationPage();
    }

    typeAppName(input) {
        Util.waitUntilElementIsVisible(this.appName);
        this.clearText(this.appName);
        this.appName.sendKeys(input);
        return this;
    }

    clickAppName() {
        Util.waitUntilElementIsVisible(this.appName);
        this.appName.click();
        return this;
    }

    getAppName() {
        Util.waitUntilElementIsVisible(this.appName);
        return this.appName.getAttribute('value');
    }

    typeTaskId(input) {
        Util.waitUntilElementIsVisible(this.taskId);
        this.clearText(this.taskId);
        this.taskId.sendKeys(input);
        return this;
    }

    getTaskId() {
        Util.waitUntilElementIsVisible(this.taskId);
        return this.taskId.getAttribute('value');
    }

    typeTaskName(input) {
        Util.waitUntilElementIsVisible(this.taskName);
        this.clearText(this.taskName);
        this.taskName.sendKeys(input);
        return this;
    }

    getTaskName() {
        Util.waitUntilElementIsVisible(this.taskName);
        return this.taskName.getAttribute('value');
    }

    typeItemsPerPage(input) {
        Util.waitUntilElementIsVisible(this.itemsPerPage);
        this.clearText(this.itemsPerPage);
        this.itemsPerPage.sendKeys(input);
        return this;
    }

    getItemsPerPage() {
        Util.waitUntilElementIsVisible(this.itemsPerPage);
        return this.itemsPerPage.getAttribute('value');
    }

    typeProcessDefinitionId(input) {
        Util.waitUntilElementIsVisible(this.processDefinitionId);
        this.clearText(this.processDefinitionId);
        this.processDefinitionId.sendKeys(input);
        return this;
    }

    getProcessDefinitionId() {
        Util.waitUntilElementIsVisible(this.processInstanceId);
        return this.processInstanceId.getAttribute('value');
    }

    selectSelectionMode(mode) {
        this.clickOnSelectionModeDropDownArrow();

        let modeElement = element.all(by.cssContainingText('mat-option span', mode)).first();
        Util.waitUntilElementIsClickable(modeElement);
        Util.waitUntilElementIsVisible(modeElement);
        modeElement.click();
        return this;
    }

    clickOnSelectionModeDropDownArrow() {
        Util.waitUntilElementIsVisible(this.modeDropDownArrow);
        this.modeDropDownArrow.click();
        Util.waitUntilElementIsVisible(this.modeSelector);
    }

    typeAssignee(input) {
        Util.waitUntilElementIsVisible(this.assignee);
        this.clearText(this.assignee);
        this.assignee.sendKeys(input);
        return this;
    }

    getAssignee() {
        Util.waitUntilElementIsVisible(this.assignee);
        return this.assignee.getAttribute('value');
    }

    typeProcessInstanceId(input) {
        Util.waitUntilElementIsVisible(this.processInstanceId);
        this.clearText(this.processInstanceId);
        this.processInstanceId.sendKeys(input);
        return this;
    }

    getProcessInstanceId() {
        Util.waitUntilElementIsVisible(this.processInstanceId);
        return this.processInstanceId.getAttribute('value');
    }

    getItemsPerPageFieldErrorMessage() {
        Util.waitUntilElementIsVisible(this.itemsPerPageForm);
        let errorMessage = this.itemsPerPageForm.element(by.css('mat-error'));
        Util.waitUntilElementIsVisible(errorMessage);
        return errorMessage.getText();
    }

    typePage(input) {
        Util.waitUntilElementIsVisible(this.page);
        this.clearText(this.page);
        this.page.sendKeys(input);
        return this;
    }

    getPage() {
        Util.waitUntilElementIsVisible(this.page);
        return this.page.getAttribute('value');
    }

    getPageFieldErrorMessage() {
        Util.waitUntilElementIsVisible(this.pageForm);
        let errorMessage = this.pageForm.element(by.css('mat-error'));
        Util.waitUntilElementIsVisible(errorMessage);
        return errorMessage.getText();
    }

    typeDueAfter(input) {
        Util.waitUntilElementIsVisible(this.dueAfter);
        this.clearText(this.dueAfter);
        this.dueAfter.sendKeys(input);
        return this;
    }

    typeDueBefore(input) {
        Util.waitUntilElementIsVisible(this.dueBefore);
        this.clearText(this.dueBefore);
        this.dueBefore.sendKeys(input);
        return this;
    }

    typeCurrentDate(input) {
        Util.waitUntilElementIsVisible(this.currentDate);
        this.clearText(this.currentDate);
        this.currentDate.sendKeys(input);
        return this;
    }

    clearText(input) {
        Util.waitUntilElementIsVisible(input);
        return input.clear();
    }

    clickResetButton() {
        Util.waitUntilElementIsVisible(this.resetButton);
        this.resetButton.click();
    }

    getAllProcessDefinitionIds() {
        return this.taskListCloud().getDataTable().getAllRowsColumnValues('Process Definition Id');
    }

    getAllProcessInstanceIds() {
        return this.taskListCloud().getDataTable().getAllRowsColumnValues('Process Instance Id');
    }

}

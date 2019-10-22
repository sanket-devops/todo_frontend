import {Component, OnInit} from '@angular/core';
import {TestService} from './test.service';
import {Idata} from './Idata';
import 'toastr';

import * as moment from 'moment';

declare let $: any;
declare let toastr: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  dataTable;
  data: Idata = <any>{};

  constructor(public testService: TestService) {
  }

  ngOnInit() {
    this.loadData();
  }

  add() {
    this.data = <any>{};
  }

  loadData() {
    this.testService.getApi().subscribe((data: Idata[]) => {
      if (this.dataTable) {
        this.dataTable.destroy();
      }

      for (let todo of data) todo.created_at = moment(todo.created_at).format('MM-DD-YYYY h:mm:ss a');


      this.dataTable = $('#example').DataTable({
        data: data,

        columns: [
          {title: 'Id', data: 'id'},
          // {title: 'userId', data: 'userId'},
          {title: 'Title', data: 'title'},
          {title: 'Description', data: 'description'},
          {title: 'Time', data: 'created_at'},
          {
            title: 'Action',
            render: (obj, type, row: Idata) => {
              // console.log(row);
              return `<div class="text-nowrap">
                        <button name="action_delete" data-id="${row.id}" class="btn btn-danger">Delete</button>
                        <button name="action_edit" data-id="${row.id}" class="btn btn-success">Edit</button>
                      </div>
                  `;
            }
          },
        ],
        initComplete: () => {
          $('button[name=\'action_delete\']').on('click', async (event: Event) => {
            let element = $(event.target);
            let id: string = element.data('id');
            // perform delete api call.
            console.log(id);
            let res = await this.testService.deleteApi(id).toPromise();
            console.log(res);
            toastr.success('Data Deleted Sucsessfully!');
            this.loadData();
          });
          $('button[name=\'action_edit\']').on('click', async (event: Event) => {
            let element = $(event.target);
            let id: string = element.data('id');

            // perform edit api call.
            console.log(id);
            $('#myModal').modal('show');
            let res = await this.testService.getById(id).toPromise();
            this.data = <Idata>res;
          });
        }
      });
    });
  }

  async saveData() {
    console.log(this.data);

    if (this.data.id) {
      // edit
      let res = await this.testService.updateData(this.data).toPromise();
      console.log(res);
      $('#myModal').modal('hide');
      toastr.success('Data Updated Sucsessfully!');
      this.loadData();
    } else {
      // add
      let res = await this.testService.postData(this.data).toPromise();
      console.log(res);
      $('#myModal').modal('hide');
      toastr.success('Data Added Sucsessfully!');
      this.loadData();
    }
  }
}

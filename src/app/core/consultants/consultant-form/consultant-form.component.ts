import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OpenService } from 'src/app/shared/services/open.service';

import { Consultant, newConsultant } from './../consultants.models'


export class ConsultantFormBuilder {
  constructor(private formBuilder: FormBuilder) {
  }

  buildForm(parlour) {
    return this.buildConsultantForm(parlour);
  }

  buildConsultantForm(details) {
    details = details === undefined ? newConsultant() : details;
    return this.formBuilder.group({
      'id': [details.id],
      'first_name': [details.first_name, [Validators.required, Validators.minLength(6)]],
      'last_name': [details.last_name, [Validators.required, Validators.minLength(6)]],
      'email': [details.email, [Validators.required]],
      'username': [details.username, [Validators.required, Validators.minLength(6)]],
      'branch': [details.branch, [Validators.required]],
      'number': [details.number, [Validators.required]]
    });
  }
}


@Component({
  selector: 'app-consultant-form',
  templateUrl: './consultant-form.component.html',
  styleUrls: ['./consultant-form.component.css']
})
export class ConsultantFormComponent implements OnInit {

  consultant: any;
  formBuilder: ConsultantFormBuilder;
  form: FormGroup;
  user: any;
  parlour_id: number;
  permission: any

  constructor(public openService: OpenService,
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder) {
      this.formBuilder = new ConsultantFormBuilder(fb);
     }

  ngOnInit(): void {
    this.permission = this.openService.getPermissions();
    this.user = this.openService.getUser();
    this.parlour_id = this.permission == "Parlour" ? this.user.id : this.user.parlour_id;
    this.route.params.subscribe(
      (params) => {
        const id = +params['id'];
        if (id){
          this.getConsultant(id);
        }else{
          this.initForm(this.consultant);
        }
      }
    )
  }
  
  getConsultant(id) {
    this.openService.getOne(`consultants/${id}`)
      .subscribe(
        consultant => {
          this.consultant = consultant
          this.initForm(this.consultant);
        },
        error => console.log("ERROR"));
  }

  initForm(consultant: Consultant) {
    this.consultant = consultant;
    this.form = this.formBuilder.buildForm(this.consultant);
  }

  submit() {
    let formValue = this.form.value;
    formValue["parlour_id"] = this.parlour_id
    console.log(formValue);
    if (this.consultant) {
      this.openService.put(`consultants/${this.consultant.id}/update`, formValue)
        .subscribe(
          (user: any) => {
            
          },
        error => {
            console.log(error);
        });
    }else {
      this.openService.post(`consultants`, formValue)
        .subscribe(
          (user: any) => {

          },
        error => {
            console.log(error);
        });
    }
  }

  goBack(event) {
    event.preventDefault();
    window.history.back();
  }

}
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OpenService, CommonService } from 'src/app/shared/services/open.service';
import { MainMember, newMainMember, newApplicant } from './../main-members.models';
import { ToastrService } from 'ngx-toastr';
import { validateMSISDN, validateSAIDNumber } from 'src/app/shared/validation';
import {Directive} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";


interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export class MainMemberFormBuilder {
  constructor(private formBuilder: FormBuilder) {
  }

  buildForm(main_member) {
    return this.buildMainMemberForm(main_member);
  }

  buildMainMemberForm(details) {
    details = details === undefined ? newMainMember() : details;
    return this.formBuilder.group({
      'id': [details.id],
      'first_name': [details.first_name, [Validators.required]],
      'last_name': [details.last_name, [Validators.required]],
      'id_number': [details.id_number, [Validators.required, validateSAIDNumber]],
      'date_joined': [details.date_joined, [Validators.required]],
      'contact': [details.contact, [Validators.required, validateMSISDN]],
      'applicant': this.buildApplicantForm(details.applicant),
      'plan_id': [details.plan_id, [Validators.required]]
    });
  }

  buildPlan(details) {
    details = details === undefined ? {'id': null, 'name': null} : details;
    return this.formBuilder.group({
      'id': [details.id, [Validators.required]],
    });
  }

  buildApplicantForm(details) {
    details = details === undefined ? newApplicant() : details;
    return this.formBuilder.group({
        'id': [details.id],
        'policy_num': [details.policy_num, [Validators.required]],
        'document': [details.document, [Validators.required]],
        'cancelled': [details.cancelled, [Validators.required]],
        'status': [details.status, [Validators.required]],
        'date': [details.date, [Validators.required]],
        'address': [details.address, [Validators.required]],
        'plan': this.buildPlan(details.plan)
    });
  }
}


@Directive({
    selector: "input[type=file]",
    host : {
        "(change)" : "onChange($event.target.files)",
        "(blur)": "onTouched()"
    },
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: FileValueAccessor, multi: true }
    ]
})
export class FileValueAccessor implements ControlValueAccessor {
    value: any;
    onChange = (_) => {};
    onTouched = () => {};

    writeValue(value) {}
    registerOnChange(fn: any) { this.onChange = fn; }
    registerOnTouched(fn: any) { this.onTouched = fn; }
}


@Component({
  selector: 'app-main-member-form',
  templateUrl: './main-member-form.component.html',
  styleUrls: ['./main-member-form.component.css']
})
export class MainMemberFormComponent implements OnInit  {
  main_member: any;
  submitted = false;
  formBuilder: MainMemberFormBuilder;
  form: FormGroup;
  parlour_id: any;
  user: any;
  plans: Array<any> = [];
  plan: any;
  optionSelected: any;
  selectedFile: File = null;

  constructor(public openService: OpenService,
    public service: CommonService,
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService) {
      this.formBuilder = new MainMemberFormBuilder(fb);
     }

  ngOnInit(): void {
    this.parlour_id = this.openService.getParlourId();
    this.user = this.openService.getUser()
    this.transition(this.user);
    this.route.params.subscribe(
      (params) => {
        const id = +params['id'];
        if (id){
          this.getMainMember(id);
        }else{
          this.initPlans();
          this.initForm(this.main_member);
        }
      }
    )
  }

  transition(user: any) {
    this.service.switchHeader(user);
  }

  getCurrentPlan(plan_id) {
    this.openService.getOne(`plans/${plan_id}/get`)
      .subscribe(
        plan => {
          this.plan = plan;
          this.initForm(this.plan);
        },
        error => console.log(error));
  }
  initForm(main_member: MainMember) {
    this.main_member = main_member;
    this.form = this.formBuilder.buildForm(this.main_member);
  }

  getMainMember(id) {
    this.openService.getOne(`main-members/${id}/get`)
      .subscribe(
        main_member => {
          this.main_member = main_member;
          this.initPlans();
          this.initForm(this.main_member);
        },
        error => console.log("ERROR"));
  }

  onFileSelected(target ) {
    let files = (target as HTMLInputElement).files
    this.selectedFile = files.item(0);
  }

  submitFile(main_member) {
    const uploadFormData = new FormData();
    uploadFormData.append('myFile', this.selectedFile, this.selectedFile.name);

    this.openService.postFile(`main-members/${main_member.id}/upload`, uploadFormData)
      .subscribe(
        () => {

        },
      error => {
        let err = error['error'];
        this.toastr.error(err['description'], error['title'], {timeOut: 3000});
      });
  }

  submit() {
    const formValue = this.form.value;
    formValue["parlour_id"] = this.parlour_id;

    if (this.main_member) {
      this.openService.put(`main-members/${this.main_member.id}/update`, formValue)
        .subscribe(
          (main_member: any) => {
            this.submitted = true;

            if (this.selectedFile){
              this.submitFile(main_member);
            }
            this.showSuccess();
          },
        error => {
          let err = error['error'];
          this.toastr.error(err['description'], error['title'], {timeOut: 3000});
        });
    }else {
      this.openService.post(`consultants/${this.user.id}/main-members`, formValue)
        .subscribe(
          (main_member: any) => {
            if (this.selectedFile){
              this.submitFile(main_member);
            }

            this.showSuccess();
            this.submitted = true;
          },
        error => {
          let err = error['error'];
          this.toastr.error(err['description'], error['title'], {timeOut: 3000});
        });
    }
  }

  showSuccess() {
    this.toastr.success('New Applicant saved successfully!', 'Success!!!');
  }

  goBack(event) {
    event.preventDefault();
    window.history.back();
  }

  getAge() {
    if (this.main_member) {
      const year_digits = this.main_member.id_number ? this.main_member.id_number.substr(0,2) : null;

      let this_year = new Date().getFullYear().toString().substr(2,3);
      if (year_digits) {
          if (parseInt(year_digits) >= 0 && parseInt(year_digits) < 35) {
            const age = parseInt(this_year) - parseInt(year_digits);
            return age + " years old";
          }
          const year_born = "19" + year_digits;
          this_year = new Date().getFullYear().toString()

          const age = parseInt(this_year) - parseInt(year_born)
          return age + " years old";
      }
    }
    return null;
  }

  showError(error) {
    let errors = {};
    errors = error.json();
    const description = errors.hasOwnProperty('errors') ? this.getErrorDetails(error) : errors['description'];
    this.toastr.error(description, errors['title'], {timeOut: 3000});

  }

  getErrorDetails(error) {
    const body = error.json();
    let dets = '';
    for (const key of Object.keys(body['errors'])) {
      dets += `${key} - ${body['errors'][key]}\n`;
    }
    return dets;
  }

  initPlans() {
    this.openService.getUrl(`parlours/${this.parlour_id}/plans/all`)
    .subscribe((plans: any) => {

      this.plans = plans.map((plan: any) => {
          if (this.main_member && plan.id == this.main_member.applicant.plan.id) {
            this.optionSelected = plan.id;
          }
          return {
            id: plan.id,
            name: plan.plan
          };
      });
      this.plans.unshift({id: 0, name: "-- Select Plan --"});
      if (this.optionSelected == undefined) {
        this.optionSelected = 0;
      }
    },
    error => {
      this.showError(error);
    });
  }

  onOptionsSelected(event){
    this.optionSelected =  event; //option value will be sent as event
  }
}

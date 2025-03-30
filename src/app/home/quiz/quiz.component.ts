import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProfileService } from '../../profiles/profile.service';
import { Subscription } from 'rxjs';
import { Genre, Instrument, Qualification, SharedDataService } from '../../components/shared-data-service.component';
import {TuitionRegion} from "../../profiles/interfaces/tuition-region.model";

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit, OnDestroy {
  stepOneFormGroup!: FormGroup;
  stepTwoFormGroup!: FormGroup;
  stepThreeFormGroup!: FormGroup;
  stepFourFormGroup!: FormGroup;
  stepFiveFormGroup!: FormGroup;
  stepSixFormGroup!: FormGroup;

  lessonTypes = [
    { id: 'Online', name: 'Online only', selected: false },
    { id: 'In Person', name: 'In person only ', selected: false },
    { id: 'Online & In-Person', name: 'Online And Inperson', selected: false }
  ];

  instruments: Instrument[] = [];
  genres: Genre[] = [];
  qualifications: Qualification[] = [];

  regionSuggestions: any[] = [];
  selectedRegion: TuitionRegion | null = null;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private sharedData: SharedDataService
  ) {}

  ngOnInit(): void {

    this.sharedData.loadInstruments();
    this.sharedData.loadGenres();
    this.sharedData.loadQualifications();

    this.subscriptions.add(
      this.sharedData.instruments$.subscribe(data => {
        if (data) {
          this.instruments = data;
          this.initialiseInstrumentsForm();
        }
      })
    );

    this.subscriptions.add(
      this.sharedData.genres$.subscribe(data => {
        if (data) {
          this.genres = data;
          this.initialiseGenresForm();
        }
      })
    );

    this.subscriptions.add(
      this.sharedData.qualifications$.subscribe(data => {
        if (data) {
          this.qualifications = data;
          this.initialiseQualificationsForm();
        }
      })
    );

    this.sharedData.regions$.subscribe((data) => {
      this.regionSuggestions = data;
    })

    this.stepOneFormGroup = this.fb.group({
      lessonType: ['', Validators.required]
    });

    this.initialisePriceForm();
    this.initialiseRegionForm();

  }

  private initialiseRegionForm(): void {
    this.stepSixFormGroup = this.fb.group({
      regionSearch: [''],
      region: [null]
    });
  }


  private initialiseInstrumentsForm(): void {
    this.stepTwoFormGroup = this.fb.group({
      instruments: this.fb.array(this.instruments.map(() => false))
    });
  }

  private initialiseGenresForm(): void {
    this.stepThreeFormGroup = this.fb.group({
      genres: this.fb.array(this.genres.map(() => false))
    });
  }

  private initialiseQualificationsForm(): void {
    this.stepFourFormGroup = this.fb.group({
      qualifications: this.fb.array(this.qualifications.map(() => false))
    });
  }

  private initialisePriceForm(): void {
    // Default price range: minimum 0 and maximum 100.
    this.stepFiveFormGroup = this.fb.group({
      minPrice: [0, [Validators.required, Validators.min(0)]],
      maxPrice: [100, [Validators.required, Validators.min(0)]]
    });
  }

  get instrumentsArray(): FormArray {
    return this.stepTwoFormGroup.get('instruments') as FormArray;
  }

  get genresArray(): FormArray {
    return this.stepThreeFormGroup.get('genres') as FormArray;
  }

  get qualificationsArray(): FormArray {
    return this.stepFourFormGroup.get('qualifications') as FormArray;
  }

  get selectedInstruments() {
    return this.instruments.filter((_, index) => this.instrumentsArray.at(index).value);
  }

  get selectedGenres() {
    return this.genres.filter((_, index) => this.genresArray.at(index).value);
  }

  get selectedQualifications() {
    return this.qualifications.filter((_, index) => this.qualificationsArray.at(index).value);
  }

  onSubmitQuiz(): void {
    const criteria: any = {
      lessonType: [this.stepOneFormGroup.value.lessonType.id],
      instruments: this.selectedInstruments.map(inst => inst.id),
      genres: this.selectedGenres.map(genre => genre.id),
      qualifications: this.selectedQualifications.map(qual => qual.id),
      priceRange: [this.stepFiveFormGroup.value.minPrice,
                   this.stepFiveFormGroup.value.maxPrice],
      tuitionRegion: this.selectedRegion
    };

    console.log('Quiz criteria:', criteria);

    this.profileService.getFilteredProfiles(criteria, 0, 3, 'averageRating,desc')
      .subscribe({
        next: (result) => {
        },
        error: (err) => {
          console.error('Error fetching filtered profiles:', err);
        }
      });
  }

  onRegionSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    const query = target.value;
    this.sharedData.searchRegions(query);
  }

  selectRegion(region: any): void {
    this.selectedRegion = region;
    this.sharedData.selectRegion(region);
  }

  clearSelection() {
    this.selectedRegion = null;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}

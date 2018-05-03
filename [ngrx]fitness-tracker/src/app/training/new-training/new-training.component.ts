import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { UIService } from '../../shared/ui.service';
import * as fromTraining from '../training.reducer';
import * as fromRoot from '../../app.reducer';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit {
  exercises$: Observable<Exercise[]>;
  isLoading$: Observable<boolean>;
  selected: string;
  @Output() isListening: EventEmitter<boolean> = new EventEmitter(true);

  constructor(
    private trainingService: TrainingService,
    private uiService: UIService,
    private store: Store<fromTraining.State>
  ) { }

  ngOnInit() {
    this.isListening.emit(false);
    this.isLoading$ = this.store.select(fromRoot.getIsLoading);
    this.exercises$ = this.store.select(fromTraining.getAvailableExercises);
    this.fetchExercises();
  }

  fetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  onMicBtnClick(form: NgForm) {
    var component = this;
    component.isListening.emit(true);

    this.exercises$.subscribe(exercises => {

      // TODO: Refactor to have better structure; get into separate reducer or service
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

      var trainings = exercises.map(e => e.name.toLowerCase());
      var grammar = '#JSGF V1.0; grammar trainings; public <trainig> = ' + trainings.join(' | ') + ' ;'

      var recognition = new SpeechRecognition();
      var speechRecognitionList = new SpeechGrammarList();

      speechRecognitionList.addFromString(grammar, 1);

      recognition.grammars = speechRecognitionList;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.start();

      recognition.onresult = function (event) {
        component.isListening.emit(false);
        var last = event.results.length - 1;
        var training = event.results[last][0].transcript;
        var found = exercises.filter(e => e.name.toLowerCase() == training.toLowerCase());
        if (!found || !found.length) {
          component.uiService.showSnackbar(`Excercise: ${training} was not found! Please try again.`, null, 3000);
        } else {
          component.selected = found[0].id;
        }
      }

      recognition.onspeechend = function () {
        component.isListening.emit(false);
        recognition.stop();
      }

      recognition.onnomatch = function (event) {
        component.isListening.emit(false);
        component.uiService.showSnackbar(`Training did not match!`, null, 3000);
      }

      recognition.onerror = function (event) {
        component.isListening.emit(false);
        component.uiService.showSnackbar('Training not found. Please try again!', null, 3000);
      }
    });
  }
}

/*
    1. -> simple observer + observable
    Expected output:
        Hi! I'm Pesho
        Hi! I'm Gosho
        Hi! I'm Mariya

        I am async!
*/
var observer = (name) => console.log(`Hi! I'm ${name}`);
var observable = new Rx.Observable(observer => {
    // the observer function is being converted into a special object 
    // which is consistent of 3 props - next(), error() and complete()
    // the next() is mandatory meanwhile the other are good to have

    let names = ['Pesho', 'Gosho', 'Mariya'];
    names.forEach(name => observer.next(name));

    // demonstrate async
    setTimeout(() => console.log('I am async!'), 2000);
});

console.log('before the subscribe');
observable.subscribe(observer);
console.log('after the subscribe');

/*
    2. -> subjects
    Expected output:
        Good job, Gosho!
        Good job, Pesho!
        What Pesho???
*/
var subject = new Rx.Subject();

// nothing happens since the subject has the next() but nothing was subscribed to that subject
subject.next('Ala-bala') 

subject.subscribe(name => console.log(`Good job, ${name}!`));
subject.next('Gosho'); // outputs: 'Good job, Gosho!'

// another subscriber is added 
subject.subscribe(name => console.log(`What ${name}???`));
subject.next('Pesho'); // both subscribers are called and executed

/*
    3. -> behavior subjects
    Expected output:
        The answer of everything is 42
        The answer of everything is 666
        The result is: 666!
        The answer of everything is 1000
        The result is: 1000!
*/
var behaviorSubject = new Rx.BehaviorSubject(42); // provided value in constructor
var observer = n => console.log(`The answer of everything is ${n}`);

behaviorSubject.subscribe(observer); // outputs: 'The answer of everything is 42'

behaviorSubject.next(666); // outputs: 'The answer of everything is 666'

behaviorSubject.subscribe(number => console.log(`The result is: ${number}!`));
behaviorSubject.next(1000);

/*
    3. -> schedulers
    Expected output:
        just before subscribe
        just after subscribe
        got value 1
        got value 2
        got value 3
        done
*/
var observable = Rx.Observable.create(observer => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
  })
  .observeOn(Rx.Scheduler.async);
  
  console.log('just before subscribe');
  observable.subscribe({
    next: x => console.log('got value ' + x),
    error: err => console.error('something wrong occurred: ' + err),
    complete: () => console.log('done'),
  });
  console.log('just after subscribe');
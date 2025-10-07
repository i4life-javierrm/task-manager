import { Component, OnInit } from '@angular/core'; 
import { TaskService, Task } from '../services/task.service'; 
import { IonicModule } from '@ionic/angular'; // <-- Import IonicModule
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule for [(ngModel)]
import { CommonModule } from '@angular/common'; // <-- Import CommonModule for *ngFor, etc.
 
@Component({ 
  selector: 'app-home', 
  templateUrl: './home.page.html', 
  styleUrls: ['./home.page.scss'], 
  // You must list ALL required modules here for a standalone component
  standalone: true, 
  imports: [
    IonicModule,     // Provides <ion-content>, <ion-header>, <ion-list>, etc.
    FormsModule,     // Provides [(ngModel)]
    CommonModule     // Provides directives like *ngFor, [class.completed], etc.
  ]
}) 
export class HomePage implements OnInit { 
  tasks: Task[] = []; 
  newTaskTitle: string = ''; 
 
  constructor(private taskService: TaskService) { } 
 
  ngOnInit() { 
    this.loadTasks(); 
  } 
 
  loadTasks() { 
    this.taskService.getTasks().subscribe(tasks => this.tasks = tasks);
} 
 
addTask() { 
  if (!this.newTaskTitle.trim()) return;  
  this.taskService.addTask(this.newTaskTitle).subscribe(task => { 
    this.tasks.push(task); 
    this.newTaskTitle = ''; 
  }); 
} 

toggleTask(task: Task) { 
  
this.taskService.toggleTask(task._id!).subscribe(updatedTask => { 
    task.completed = updatedTask.completed; 
  }); 
} 

deleteTask(task: Task) { 
  this.taskService.deleteTask(task._id!).subscribe(() => { 
    this.tasks = this.tasks.filter(t => t._id !== task._id); 
  }); 
} 
}
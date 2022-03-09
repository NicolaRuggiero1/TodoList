package com.digitazon.TodoList.controllers;

import com.digitazon.TodoList.entities.Task;
import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {
    @Autowired
    private TaskRepository taskRepository;

    /*public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }*/

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public Iterable<Task> home() {
        Iterable<Task> tasks = taskRepository.findAll();
        return tasks;

    }

    @GetMapping("/{id}")
    public Task read(@PathVariable int id) {
        return taskRepository.findById(id).orElseThrow();
    }
}

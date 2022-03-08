package com.digitazon.TodoList.controllers;

import com.digitazon.TodoList.repositories.TaskRepository;
import org.springframework.web.bind.annotation.Mapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TaskController {
    private TaskRepository taskRepository;

    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @RequestMapping(value = "/", method = RequestMethod.GET)
    public String home() {
        long totale = taskRepository.count();
        System.out.println(totale);
        return "Benvenuti!";
    }
}

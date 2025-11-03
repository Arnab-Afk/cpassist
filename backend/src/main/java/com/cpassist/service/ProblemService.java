package com.cpassist.service;

import com.cpassist.exception.ResourceNotFoundException;
import com.cpassist.model.Problem;
import com.cpassist.repository.ProblemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProblemService {
    
    @Autowired
    private ProblemRepository problemRepository;
    
    public Page<Problem> getAllProblems(Pageable pageable) {
        return problemRepository.findAll(pageable);
    }
    
    public Problem getProblemById(String id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
    }
    
    public Page<Problem> getProblemsByTopic(String topic, Pageable pageable) {
        return problemRepository.findByTopic(topic, pageable);
    }
    
    public Page<Problem> getProblemsByDifficulty(String difficulty, Pageable pageable) {
        return problemRepository.findByDifficulty(difficulty, pageable);
    }
    
    public Page<Problem> getProblemsByTopicAndDifficulty(String topic, String difficulty, Pageable pageable) {
        return problemRepository.findByTopicAndDifficulty(topic, difficulty, pageable);
    }
    
    public Page<Problem> getProblemsByPlatform(String platform, Pageable pageable) {
        return problemRepository.findByPlatform(platform, pageable);
    }
    
    public Problem createProblem(Problem problem) {
        return problemRepository.save(problem);
    }
    
    public Problem updateProblem(String id, Problem problemDetails) {
        Problem problem = getProblemById(id);
        
        problem.setTitle(problemDetails.getTitle());
        problem.setDescription(problemDetails.getDescription());
        problem.setDifficulty(problemDetails.getDifficulty());
        problem.setTopic(problemDetails.getTopic());
        problem.setTags(problemDetails.getTags());
        problem.setPlatform(problemDetails.getPlatform());
        problem.setPlatformUrl(problemDetails.getPlatformUrl());
        problem.setProblemNumber(problemDetails.getProblemNumber());
        problem.setTestCases(problemDetails.getTestCases());
        problem.setConstraints(problemDetails.getConstraints());
        
        return problemRepository.save(problem);
    }
    
    public void deleteProblem(String id) {
        Problem problem = getProblemById(id);
        problemRepository.delete(problem);
    }
    
    public List<Problem> getProblemsByIds(List<String> ids) {
        return problemRepository.findByIdIn(ids);
    }
}

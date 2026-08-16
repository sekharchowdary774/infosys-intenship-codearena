package com.codingplatform.coding_platform.problem.service;

import java.util.List;

import com.codingplatform.coding_platform.problem.dto.ProblemRequest;
import com.codingplatform.coding_platform.problem.dto.ProblemResponse;
import com.codingplatform.coding_platform.problem.entity.Problem;
import com.codingplatform.coding_platform.problem.repository.ProblemRepository;
import org.springframework.stereotype.Service;



import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;


    // CREATE
    public ProblemResponse createProblem(
            ProblemRequest request) {

        Problem problem = new Problem();

        problem.setTitle(request.getTitle());

        problem.setDescription(request.getDescription());

        problem.setDifficulty(request.getDifficulty());

        problem.setTopic(request.getTopic());

        problem.setStarterCodeJava(
                request.getStarterCodeJava()
        );

        problem.setStarterCodePython(
                request.getStarterCodePython()
        );

        problem.setStarterCodeCpp(
                request.getStarterCodeCpp()
        );

        problem.setStarterCodeJavascript(
                request.getStarterCodeJavascript()
        );

        problem.setEditorial(
                request.getEditorial()
        );

        problem.setHints(
                request.getHints()
        );

        problem.setEditorialUnlockAttempts(
                request.getEditorialUnlockAttempts()
        );

        Problem savedProblem =
                problemRepository.save(problem);

        return convertToResponse(savedProblem);
    }


    // GET ALL
    public List<ProblemResponse> getAllProblems() {

        return problemRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }




    // GET BY ID
    public ProblemResponse getProblemById(Long id) {

        Problem problem =
                problemRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Problem not found with id: " + id
                                )
                        );

        return convertToResponse(problem);
    }


    // UPDATE
    public ProblemResponse updateProblem(
            Long id,
            ProblemRequest request) {

        Problem problem =
                problemRepository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Problem not found with id: " + id
                                )
                        );

        problem.setTitle(request.getTitle());

        problem.setDescription(request.getDescription());

        problem.setDifficulty(request.getDifficulty());

        problem.setTopic(request.getTopic());

        problem.setStarterCodeJava(
                request.getStarterCodeJava()
        );

        problem.setStarterCodePython(
                request.getStarterCodePython()
        );

        problem.setStarterCodeCpp(
                request.getStarterCodeCpp()
        );

        problem.setStarterCodeJavascript(
                request.getStarterCodeJavascript()
        );

        problem.setEditorial(
                request.getEditorial()
        );

        problem.setHints(
                request.getHints()
        );

        problem.setEditorialUnlockAttempts(
                request.getEditorialUnlockAttempts()
        );

        Problem updatedProblem =
                problemRepository.save(problem);

        return convertToResponse(updatedProblem);
    }


    // DELETE
    public void deleteProblem(Long id) {

        if (!problemRepository.existsById(id)) {

            throw new RuntimeException(
                    "Problem not found with id: " + id
            );
        }

        problemRepository.deleteById(id);
    }
    private ProblemResponse convertToResponse(Problem problem) {

        ProblemResponse response = new ProblemResponse();

        response.setId(problem.getId());
        response.setTitle(problem.getTitle());
        response.setDescription(problem.getDescription());
        response.setDifficulty(problem.getDifficulty());
        response.setTopic(problem.getTopic());

        response.setStarterCodeJava(
                problem.getStarterCodeJava()
        );

        response.setStarterCodePython(
                problem.getStarterCodePython()
        );

        response.setStarterCodeCpp(
                problem.getStarterCodeCpp()
        );

        response.setStarterCodeJavascript(
                problem.getStarterCodeJavascript()
        );

        response.setEditorial(
                problem.getEditorial()
        );

        response.setHints(
                problem.getHints()
        );

        response.setEditorialUnlockAttempts(
                problem.getEditorialUnlockAttempts()
        );

        return response;
    }
}

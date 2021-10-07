var documenterSearchIndex = {"docs":
[{"location":"library/overview/#library","page":"Library Functions","title":"Library Functions","text":"","category":"section"},{"location":"library/overview/#FMIFlux-functions","page":"Library Functions","title":"FMIFlux functions","text":"","category":"section"},{"location":"library/overview/","page":"Library Functions","title":"Library Functions","text":"ME_NeuralFMU\nCS_NeuralFMU\nNeuralFMU\nNeuralFMUInputLayer\nNeuralFMUOutputLayer\n\nNeuralFMUCacheTime\nNeuralFMUCacheState","category":"page"},{"location":"library/overview/#FMIFlux.ME_NeuralFMU","page":"Library Functions","title":"FMIFlux.ME_NeuralFMU","text":"Structure definition for a NeuralFMU, that runs in mode Model Exchange (ME).\n\n\n\n\n\n","category":"type"},{"location":"library/overview/#FMIFlux.CS_NeuralFMU","page":"Library Functions","title":"FMIFlux.CS_NeuralFMU","text":"Structure definition for a NeuralFMU, that runs in mode Co-Simulation (CS).\n\n\n\n\n\n","category":"type"},{"location":"library/overview/#FMIFlux.NeuralFMU","page":"Library Functions","title":"FMIFlux.NeuralFMU","text":"The mutable struct representing an abstract (simulation mode unknown) NeuralFMU.\n\n\n\n\n\n","category":"type"},{"location":"library/overview/#FMI-version-independent-functions","page":"Library Functions","title":"FMI version independent functions","text":"","category":"section"},{"location":"library/overview/","page":"Library Functions","title":"Library Functions","text":"fmiDoStepME\nfmiDoStepCS\nfmiInputDoStepCSOutput","category":"page"},{"location":"library/overview/#FMIFlux.fmiDoStepME","page":"Library Functions","title":"FMIFlux.fmiDoStepME","text":"Wrapper. Call fmi2DoStepME for more information.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMIFlux.fmiDoStepCS","page":"Library Functions","title":"FMIFlux.fmiDoStepCS","text":"Wrapper. Call fmi2DoStepCS for more information.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMIFlux.fmiInputDoStepCSOutput","page":"Library Functions","title":"FMIFlux.fmiInputDoStepCSOutput","text":"Wrapper. Call fmi2InputDoStepCSOutput for more information.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#Additional-functions","page":"Library Functions","title":"Additional functions","text":"","category":"section"},{"location":"library/overview/","page":"Library Functions","title":"Library Functions","text":"mse_interpolate\ntransferParams!","category":"page"},{"location":"library/overview/#FMIFlux.mse_interpolate","page":"Library Functions","title":"FMIFlux.mse_interpolate","text":"Compares non-equidistant (or equdistant) datapoints by linear interpolating and comparing at given interpolation points t_comp.  (Zygote-friendly: Zygote can differentiate through via AD.)\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMIFlux.transferParams!","page":"Library Functions","title":"FMIFlux.transferParams!","text":"Writes/Copies training parameters from p_net to net with data offset c.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMI-2-version-dependent-functions","page":"Library Functions","title":"FMI 2 version dependent functions","text":"","category":"section"},{"location":"library/overview/","page":"Library Functions","title":"Library Functions","text":"fmi2DoStepME\nfmi2DoStepCS\nfmi2InputDoStepCSOutput","category":"page"},{"location":"library/overview/#FMIFlux.fmi2DoStepME","page":"Library Functions","title":"FMIFlux.fmi2DoStepME","text":"Performs the equivalent of fmiDoStep for ME-FMUs (note, that fmiDoStep is for CS-FMUs only). Currently no event handling supported (but often not necessary, if the training loop is robust against small/short errors in the loss gradient). Note, that event-handling during ME simulation in FMI.jl itself is supported.\n\nOptional, additional FMU-values can be set via keyword arguments setValueReferences and setValues. Optional, additional FMU-values can be retrieved by keyword argument getValueReferences.\n\nFunction takes the current system state array (\"x\") and returns an array with state derivatives (\"x dot\") and optionally the FMU-values for getValueReferences. Setting the FMU time via argument t is optional, if not set, the current time of the ODE solver around the NeuralFMU is used.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMIFlux.fmi2DoStepCS","page":"Library Functions","title":"FMIFlux.fmi2DoStepCS","text":"Performs a fmiDoStep for CS-FMUs (note, that fmiDoStep is for CS-FMUs only).\n\nOptional, FMU-values can be set via keyword arguments setValueReferences and setValues. Optional, FMU-values can be retrieved by keyword argument getValueReferences.\n\nFunction returns the FMU-values for the optional getValueReferences. The CS-FMU performs one macro step with step size dt. Dependent on the integrated numerical solver, the FMU may perform multiple (internal) micro steps if needed to meet solver requirements (stability/accuracy). These micro steps are hidden by FMI.\n\n\n\n\n\n","category":"function"},{"location":"library/overview/#FMIFlux.fmi2InputDoStepCSOutput","page":"Library Functions","title":"FMIFlux.fmi2InputDoStepCSOutput","text":"Sets all FMU inputs to u, performs a ´´´fmi2DoStep´´´ and returns all FMU outputs.\n\n\n\n\n\n","category":"function"},{"location":"examples/simple_hybrid_CS/#simpleCS","page":"Simple hybrid CS","title":"Training a simple Hybrid CS FMU","text":"","category":"section"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"This example explains how to create and train a CS-Neural FMU.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"First the necessary libraries are loaded and the FMU is prepared for simulation.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"#\n# Copyright (c) 2021 Tobias Thummerer, Lars Mikelsons\n# Licensed under the MIT license. See LICENSE file in the project root for details.\n#\n\n################################## INSTALLATION ####################################################\n# (1) Enter Package Manager via     ]\n# (2) Install FMI via               add FMI       or   add \"https://github.com/ThummeTo/FMI.jl\"\n# (3) Install FMIFlux via           add FMIFlux   or   add \"https://github.com/ThummeTo/FMIFlux.jl\"\n################################ END INSTALLATION ##################################################\n\n# this example covers creation and training am CS-NeuralFMUs\n\nusing FMI\nusing FMIFlux\nusing Flux\nusing DifferentialEquations: Tsit5\nimport Plots\n\nFMUPath = joinpath(dirname(@__FILE__), \"..\", \"model\", \"SpringPendulumExtForce1D.fmu\")\n\nt_start = 0.0\nt_step = 0.01\nt_stop = 5.0\ntData = t_start:t_step:t_stop\n\nmyFMU = fmiLoad(FMUPath)\nfmiInstantiate!(myFMU; loggingOn=false)","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"Then the FMU is simulated twice. Once with an increased amplitude and inverted phase. This is used as the real Simulation data which the FMU should represent after training. During the simulation the data needed for training is collected.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"fmiSetupExperiment(myFMU, t_start, t_stop)\nfmiSetReal(myFMU, \"mass_s0\", 1.3)   # increase amplitude, invert phase\nfmiEnterInitializationMode(myFMU)\nfmiExitInitializationMode(myFMU)\n\n\n\nrealSimData = fmiSimulate(myFMU, t_start, t_stop; recordValues=[\"mass.s\", \"mass.v\", \"mass.a\"], setup=false, saveat=tData)\nfmiPlot(realSimData)\n\nfmiReset(myFMU)\nfmiSetupExperiment(myFMU, t_start, t_stop)\nfmiEnterInitializationMode(myFMU)\nfmiExitInitializationMode(myFMU)\n\nfmuSimData = fmiSimulate(myFMU, t_start, t_stop; recordValues=[\"mass.s\", \"mass.v\", \"mass.a\"], setup=false, saveat=tData)\nfmiPlot(fmuSimData)","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"Before the training can start the loss and callback functions are defined.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"######\n\nextF = zeros(length(tData)) # no external force\nposData = fmi2SimulationResultGetValues(realSimData, \"mass.s\")\nvelData = fmi2SimulationResultGetValues(realSimData, \"mass.v\")\naccData = fmi2SimulationResultGetValues(realSimData, \"mass.a\")\n\n# loss function for training\nfunction losssum()\n    solution = problem(t_step; inputs=extF)\n\n    accNet = collect(data[2] for data in solution)\n    #velNet = collect(data[3] for data in solution)\n\n    Flux.Losses.mse(accNet, accData) #+ Flux.Losses.mse(velNet, velData)\nend\n\n# callback function for training\nglobal iterCB = 0\nfunction callb()\n    global iterCB += 1\n\n    if iterCB % 10 == 1\n        avg_ls = losssum()\n        @info \"Loss: $(round(avg_ls, digits=5))\"\n    end\nend","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"After that the net is created and trained.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"# NeuralFMU setup\nnumInputs = length(myFMU.modelDescription.inputValueReferences)\nnumOutputs = length(myFMU.modelDescription.outputValueReferences)\n\nnet = Chain(inputs -> fmiInputDoStepCSOutput(myFMU, t_step, inputs),\n            Dense(numOutputs, 16, tanh),\n            Dense(16, 16, tanh),\n            Dense(16, numOutputs))\n\nproblem = CS_NeuralFMU(myFMU, net, (t_start, t_stop); saveat=tData)\nsolutionBefore = problem(t_step; inputs=extF)\n\n# train it ...\np_net = Flux.params(problem)\n\noptim = ADAM()\nFlux.train!(losssum, p_net, Iterators.repeated((), 300), optim; cb=callb) # Feel free to increase training steps or epochs for better results","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"And the results are plotted.","category":"page"},{"location":"examples/simple_hybrid_CS/","page":"Simple hybrid CS","title":"Simple hybrid CS","text":"###### plot results a\nsolutionAfter = problem(t_step; inputs=extF)\nfig = Plots.plot(xlabel=\"t [s]\", ylabel=\"mass acceleration [m s^-2]\", linewidth=2,\n    xtickfontsize=12, ytickfontsize=12,\n    xguidefontsize=12, yguidefontsize=12,\n    legendfontsize=12, legend=:bottomright)\nPlots.plot!(fig, tData, fmi2SimulationResultGetValues(fmuSimData, \"mass.a\"), label=\"FMU\", linewidth=2)\nPlots.plot!(fig, tData, accData, label=\"reference\", linewidth=2)\nPlots.plot!(fig, tData, collect(data[2] for data in solutionAfter), label=\"NeuralFMU\", linewidth=2)\nPlots.savefig(fig, \"exampleResult_a.pdf\")\n\nfmiUnload(myFMU)","category":"page"},{"location":"examples/advanced_hybrid_ME/#advancedME","page":"Advanced hybrid ME","title":"Training an advanced Hybrid ME FMU","text":"","category":"section"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"This example explains how to create and train a more complex ME-Neural FMU.","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"First the necessary libraries are loaded and the FMUs are prepared for simulation. One FMU contains the real model, the other one the model that is trained.","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"\n#\n# Copyright (c) 2021 Tobias Thummerer, Lars Mikelsons\n# Licensed under the MIT license. See LICENSE file in the project root for details.\n#\n\n################################## INSTALLATION ####################################################\n# (1) Enter Package Manager via     ]\n# (2) Install FMI via               add FMI       or   add \"https://github.com/ThummeTo/FMI.jl\"\n# (3) Install FMIFlux via           add FMIFlux   or   add \"https://github.com/ThummeTo/FMIFlux.jl\"\n################################ END INSTALLATION ##################################################\n\n# this example covers creation and training of a ME-NeuralFMU\n# here, solver step size is adaptive controlled for better training performance\n\nusing FMI\nusing FMIFlux\nusing Flux\nusing DifferentialEquations: Tsit5\nimport Plots\nusing Zygote\n\nmodelFMUPath = joinpath(dirname(@__FILE__), \"../model/SpringPendulum1D.fmu\")\nrealFMUPath = joinpath(dirname(@__FILE__), \"../model/SpringFrictionPendulum1D.fmu\")\n\nt_start = 0.0\nt_step = 0.1\nt_stop = 5.0\ntData = collect(t_start:t_step:t_stop)","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"The two FMUs are simulated and the data needed for training is collected.","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"myFMU = fmiLoad(realFMUPath)\nfmiInstantiate!(myFMU; loggingOn=false)\nfmiSetupExperiment(myFMU, t_start, t_stop)\n\nfmiEnterInitializationMode(myFMU)\nfmiExitInitializationMode(myFMU)\n\nx0 = fmi2GetContinuousStates(myFMU)\n\nrealSimData = fmiSimulate(myFMU, t_start, t_stop; saveat=tData, recordValues=[\"mass.s\", \"mass.v\", \"mass.f\", \"mass.a\"], setup=false)\nfmiUnload(myFMU)\n\nfmiPlot(realSimData)\n\nmyFMU = fmiLoad(modelFMUPath)\n\nfmiInstantiate!(myFMU; loggingOn=false)\nfmuSimData = fmiSimulate(myFMU, t_start, t_stop; saveat=tData, recordValues=[\"mass.s\", \"mass.v\", \"mass.a\"])\n\nposData = fmi2SimulationResultGetValues(realSimData, \"mass.s\")\nvelData = fmi2SimulationResultGetValues(realSimData, \"mass.v\")","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"Before the training can start the loss, plot and callback functions are defined.","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"# loss function for training\nglobal integratorSteps\nfunction losssum()\n    global integratorSteps, problem\n\n    solution = problem(x0)\n\n    tNet = collect(data[1] for data in solution.u)\n    posNet = collect(data[2] for data in solution.u)\n    #velNet = collect(data[3] for data in solution.u)\n\n    integratorSteps = length(tNet)\n\n    #mse_interpolate(tData, posData, tNet, posNet, tData) # mse_interpolate(tData, velData, tNet, velNet, tData)\n    Flux.mse(posData, posNet)\nend\n\n# callback function for training\nglobal iterCB = 0\nfunction callb()\n    global iterCB += 1\n    global integratorSteps\n\n    if iterCB % 10 == 1\n        avg_ls = losssum()\n        @info \"Loss: $(round(avg_ls, digits=5))   Avg displacement in data: $(round(sqrt(avg_ls), digits=5))   Integ.Steps: $integratorSteps\"\n    end\n\n    if iterCB % 100 == 1\n        fig = plotResults()\n        println(\"Fig. update.\")\n        display(fig)\n    end\nend\n\nfunction plotResults()\n    solutionAfter = problem(x0, t_start)\n    fig = Plots.plot(xlabel=\"t [s]\", ylabel=\"mass position [m]\", linewidth=2,\n        xtickfontsize=12, ytickfontsize=12,\n        xguidefontsize=12, yguidefontsize=12,\n        legendfontsize=12, legend=:bottomright)\n    Plots.plot!(fig, tData, fmi2SimulationResultGetValues(fmuSimData, \"mass.s\"), label=\"FMU\", linewidth=2)\n    Plots.plot!(fig, tData, posData, label=\"reference\", linewidth=2)\n    Plots.plot!(fig, collect(data[1] for data in solutionAfter.u), collect(data[2] for data in solutionAfter.u), label=\"NeuralFMU\", linewidth=2)\n    fig\nend","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"After that the net is created and trained. The plot function is part of the callback so the plot is updated during the training. ","category":"page"},{"location":"examples/advanced_hybrid_ME/","page":"Advanced hybrid ME","title":"Advanced hybrid ME","text":"# NeuralFMU setup\nnumStates = fmiGetNumberOfStates(myFMU)\nadditionalVRs = [fmi2String2ValueReference(myFMU, \"mass.m\")]\nnumAdditionalVRs = length(additionalVRs)\n\nnet = Chain(inputs -> fmiDoStepME(myFMU, inputs, -1.0, [], [], additionalVRs), \n            Dense(numStates+numAdditionalVRs, 16, tanh), \n            Dense(16, 16, tanh),\n            Dense(16, numStates))\n\nproblem = ME_NeuralFMU(myFMU, net, (t_start, t_stop), Tsit5(); saveat=tData)\nsolutionBefore = problem(x0, t_start)\nfmiPlot(problem)\n\n# train it ...\np_net = Flux.params(problem)\n\noptim = ADAM()\n# Feel free to increase training steps or epochs for better results\nFlux.train!(losssum, p_net, Iterators.repeated((), 1000), optim; cb=callb)\n\nfmiUnload(myFMU)","category":"page"},{"location":"contents/","page":"Contents","title":"Contents","text":"Pages = [\"index.md\", \"library.md\", \"fmu2.md\", \"parameterize.md\", \"simulateCS.md\", \"simulateME.md\"]","category":"page"},{"location":"related/#Related-Publications","page":"Related Publications","title":"Related Publications","text":"","category":"section"},{"location":"related/","page":"Related Publications","title":"Related Publications","text":"Thummerer T, Kircher J and Mikelsons L: Neural FMU: Towards structual integration of FMUs into neural networks (Preprint, accepted 14th International Modelica Conference) pdf|DOI","category":"page"},{"location":"related/","page":"Related Publications","title":"Related Publications","text":"Thummerer T, Tintenherr J, Mikelsons L: Hybrid modeling of the human cardiovascular system using NeuralFMUs (Preprint, accepted 10th International Conference on Mathematical Modeling in Physical Sciences) pdf|DOI","category":"page"},{"location":"examples/overview/#Overview","page":"Overview","title":"Overview","text":"","category":"section"},{"location":"examples/overview/","page":"Overview","title":"Overview","text":"This section discusses the included examples of the FMIFlux.jl library. So you can execute them on your machine and get detailed information about all of the steps. If you require further information about the function calls, see library functions section. For more information related to the setup and simulation of an FMU see FMI.jl library.","category":"page"},{"location":"examples/overview/","page":"Overview","title":"Overview","text":"The examples are:","category":"page"},{"location":"examples/overview/","page":"Overview","title":"Overview","text":"Simple hybrid CS: Showing how to train a Neural CS FMU.\nsimple hybrid ME: Showing how to train a Neural ME FMU.\nadvanced hybrid ME: Showing how to train an advanced Neural ME FMU.","category":"page"},{"location":"tutorials/overview/#Overview","page":"Overview","title":"Overview","text":"","category":"section"},{"location":"tutorials/overview/","page":"Overview","title":"Overview","text":"This section gives an overview and short examples on how to work with the FMIFlux.jl library. For further advise on working with FMUs, it is recommended to check the Documentation of the FMI.jl library","category":"page"},{"location":"tutorials/overview/","page":"Overview","title":"Overview","text":"The tutorials are grouped as followed:","category":"page"},{"location":"tutorials/overview/","page":"Overview","title":"Overview","text":"Still work in progress\nHow to set up a neural FMU\nHow to train a neural FMU\nPlot the results","category":"page"},{"location":"examples/simple_hybrid_ME/#simpleME","page":"Simple hybrid ME","title":"Training a simple Hybrid CS FMU","text":"","category":"section"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"This example explains how to create and train a ME-Neural FMU.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"First the necessary libraries are loaded and the FMUs are prepared for simulation. One FMU contains the real model, the other one the model that is trained.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"\n#\n# Copyright (c) 2021 Tobias Thummerer, Lars Mikelsons\n# Licensed under the MIT license. See LICENSE file in the project root for details.\n#\n\n################################## INSTALLATION ####################################################\n# (1) Enter Package Manager via     ]\n# (2) Install FMI via               add FMI       or   add \"https://github.com/ThummeTo/FMI.jl\"\n# (3) Install FMIFlux via           add FMIFlux   or   add \"https://github.com/ThummeTo/FMIFlux.jl\"\n################################ END INSTALLATION ##################################################\n\n# this example covers creation and training am ME-NeuralFMUs\n\nusing FMI\nusing FMIFlux\nusing Flux\nusing DifferentialEquations: Tsit5\nimport Plots\n\nmodelFMUPath = joinpath(dirname(@__FILE__), \"../model/SpringPendulum1D.fmu\")\nrealFMUPath = joinpath(dirname(@__FILE__), \"../model/SpringFrictionPendulum1D.fmu\")\n\nt_start = 0.0\nt_step = 0.01\nt_stop = 5.0\ntData = collect(t_start:t_step:t_stop)","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"The two FMUs are simulated and the data needed for training is collected.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"myFMU = fmiLoad(realFMUPath)\nfmiInstantiate!(myFMU; loggingOn=false)\nfmiSetupExperiment(myFMU, t_start, t_stop)\n\nfmiEnterInitializationMode(myFMU)\nfmiExitInitializationMode(myFMU)\n\nx0 = fmiGetContinuousStates(myFMU)\n\nrealSimData = fmiSimulate(myFMU, t_start, t_stop; recordValues=[\"mass.s\", \"mass.v\", \"mass.f\", \"mass.a\"], saveat=tData, setup=false)\nfmiUnload(myFMU)\n\nfmiPlot(realSimData)\n\nmyFMU = fmiLoad(modelFMUPath)\n\nfmiInstantiate!(myFMU; loggingOn=false)\nfmuSimData = fmiSimulate(myFMU, t_start, t_stop; recordValues=[\"mass.s\", \"mass.v\", \"mass.a\"], saveat=tData)\n\nposData = fmi2SimulationResultGetValues(realSimData, \"mass.s\")\nvelData = fmi2SimulationResultGetValues(realSimData, \"mass.v\")","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"Before the training can start the loss and callback functions are defined.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"# loss function for training\nfunction losssum()\n    solution = problem(x0, t_start)\n\n    tNet = collect(data[1] for data in solution.u)\n    posNet = collect(data[2] for data in solution.u)\n    #velNet = collect(data[3] for data in solution.u)\n\n    Flux.Losses.mse(posData, posNet) #+ Flux.Losses.mse(velData, velNet)\nend\n\n# callback function for training\nglobal iterCB = 0\nfunction callb()\n    global iterCB += 1\n\n    if iterCB % 10 == 1\n        avg_ls = losssum()\n        @info \"Loss: $(round(avg_ls, digits=5))   Avg displacement in data: $(round(sqrt(avg_ls), digits=5))\"\n    end\nend","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"After that the net is created and trained.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"# NeuralFMU setup\nnumStates = fmiGetNumberOfStates(myFMU)\n\nnet = Chain(inputs -> fmiDoStepME(myFMU, inputs),\n            Dense(numStates, 16, tanh),\n            Dense(16, 16, tanh),\n            Dense(16, numStates))\n\nproblem = ME_NeuralFMU(myFMU, net, (t_start, t_stop), Tsit5(); saveat=tData)\nsolutionBefore = problem(x0, t_start)\nfmiPlot(problem)\n\n# train it ...\np_net = Flux.params(problem)\n\noptim = ADAM()\nFlux.train!(losssum, p_net, Iterators.repeated((), 1000), optim; cb=callb) # Feel free to increase training steps or epochs for better results","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"And the results are plotted.","category":"page"},{"location":"examples/simple_hybrid_ME/","page":"Simple hybrid ME","title":"Simple hybrid ME","text":"###### plot results mass.s\nsolutionAfter = problem(x0, t_start)\nfig = Plots.plot(xlabel=\"t [s]\", ylabel=\"mass position [m]\", linewidth=2,\n    xtickfontsize=12, ytickfontsize=12,\n    xguidefontsize=12, yguidefontsize=12,\n    legendfontsize=12, legend=:bottomright)\nPlots.plot!(fig, tData, fmi2SimulationResultGetValues(fmuSimData, \"mass.s\"), label=\"FMU\", linewidth=2)\nPlots.plot!(fig, tData, posData, label=\"reference\", linewidth=2)\nPlots.plot!(fig, tData, collect(data[2] for data in solutionAfter.u), label=\"NeuralFMU\", linewidth=2)\nPlots.savefig(fig, \"exampleResult_s.pdf\")\n\nfmiUnload(myFMU)","category":"page"},{"location":"#FMIFlux.jl-Documentation","page":"Introduction","title":"FMIFlux.jl Documentation","text":"","category":"section"},{"location":"#What-is-FMIFlux.jl?","page":"Introduction","title":"What is FMIFlux.jl?","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"FMIFlux.jl is a free-to-use software library for the Julia programming language, which offers the ability to setup NeuralFMUs: You can place FMUs (fmi-standard.org) simply inside any feed-forward NN topology and still keep the resulting hybrid model trainable with a standard AD training process.","category":"page"},{"location":"#How-can-I-install-FMIFlux.jl?","page":"Introduction","title":"How can I install FMIFlux.jl?","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"open a Julia-Command-Window, activate your preferred environment\ngo to package manager using ] and type add FMIFlux","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"julia> ]\n\n(v.1.5.4)> add FMIFlux","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"If you want to check that everything works correctly, you can run the tests bundled with FMIFlux.jl:","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"julia> using Pkg\n\njulia> Pkg.test(\"FMIFlux\")","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Additionally, you can check the version of FMIFlux.jl that you have installed with the status command.","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"julia> ]\n(v.1.5.4)> status FMIFlux","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"Throughout the rest of the tutorial we assume that you have installed the FMIFlux.jl package and have typed using FMIFlux which loads the package:","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"julia> using FMIFlux","category":"page"},{"location":"#How-the-documentation-is-structured?","page":"Introduction","title":"How the documentation is structured?","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"Having a high-level overview of how this documentation is structured will help you know where to look for certain things. The three main parts of the documentation are :","category":"page"},{"location":"","page":"Introduction","title":"Introduction","text":"The Tutorials section explains all the necessary steps to work with the library.\nThe examples section gives insight in what is possible with this Library while using short and easily understandable code snippets\nThe library functions sections contains all the documentation to the functions provided by this library","category":"page"},{"location":"#What-is-currently-supported-in-FMIFlux.jl?","page":"Introduction","title":"What is currently supported in FMIFlux.jl?","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"building and training ME-NeuralFMUs with the default Flux-Front-End\nbuilding and training CS-NeuralFMUs","category":"page"},{"location":"#What-is-under-development-in-FMIFlux.jl?","page":"Introduction","title":"What is under development in FMIFlux.jl?","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"different modes for sensitivity estimation\ndocumentation\nmore examples","category":"page"},{"location":"#FMIFlux.jl-Index","page":"Introduction","title":"FMIFlux.jl Index","text":"","category":"section"},{"location":"","page":"Introduction","title":"Introduction","text":"","category":"page"}]
}

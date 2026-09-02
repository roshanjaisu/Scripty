--[[
  ========================================================================
  DIAGNOSTIC TEST SCRIPT (VERIFY EXECUTOR & GITHUB LOADSTRING)
  ========================================================================
  If this works:
  1. You will see an in-game notification popup on your screen.
  2. You will see a bright test window in the middle of your screen.
  3. "TEST SCRIPT EXECUTED SUCCESSFULLY!" will print in the console (F9).
  ========================================================================
]]--

local Players = game:GetService("Players")
local StarterGui = game:GetService("StarterGui")
local CoreGui = game:GetService("CoreGui")

local LocalPlayer = Players.LocalPlayer or Players.PlayerAdded:Wait()

print("========================================")
print(">>> [TEST] SCRIPT EXECUTED SUCCESSFULLY! <<<")
print(">>> Executor: Working")
print(">>> User: " .. tostring(LocalPlayer.Name))
print("========================================")

-- 1. Show native Roblox notification popup (unmissable)
pcall(function()
    StarterGui:SetCore("SendNotification", {
        Title = "✅ TEST SUCCESSFUL!",
        Text = "The script is executing properly in your executor!",
        Duration = 10
    })
end)

-- 2. Determine safe GUI parent
local parentGui = nil
if type(gethui) == "function" then
    pcall(function() parentGui = gethui() end)
end
if not parentGui then
    pcall(function() parentGui = CoreGui end)
end
if not parentGui then
    parentGui = LocalPlayer:WaitForChild("PlayerGui")
end

-- Cleanup prior test GUI
local old = parentGui:FindFirstChild("TestDiagnosticGui")
if old then pcall(function() old:Destroy() end) end

-- 3. Create a bright, unmissable Test Box on screen
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "TestDiagnosticGui"
screenGui.ResetOnSpawn = false
screenGui.DisplayOrder = 999999
screenGui.IgnoreGuiInset = true
screenGui.Parent = parentGui

local frame = Instance.new("Frame")
frame.Size = UDim2.new(0, 300, 0, 160)
frame.Position = UDim2.new(0.5, -150, 0.4, -80)
frame.BackgroundColor3 = Color3.fromRGB(15, 23, 42)
frame.BorderSizePixel = 0
frame.Active = true
frame.Draggable = true
frame.Parent = screenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = frame

local stroke = Instance.new("UIStroke")
stroke.Color = Color3.fromRGB(34, 197, 94) -- bright green
stroke.Thickness = 2
stroke.Parent = frame

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, 0, 0, 40)
title.Position = UDim2.new(0, 0, 0, 10)
title.BackgroundTransparency = 1
title.Text = "✅ TEST SCRIPT LOADED!"
title.TextColor3 = Color3.fromRGB(34, 197, 94)
title.TextSize = 16
title.Font = Enum.Font.GothamBold
title.Parent = frame

local subtitle = Instance.new("TextLabel")
subtitle.Size = UDim2.new(1, -20, 0, 45)
subtitle.Position = UDim2.new(0, 10, 0, 50)
subtitle.BackgroundTransparency = 1
subtitle.Text = "If you see this box, your executor can execute code properly!"
subtitle.TextColor3 = Color3.fromRGB(226, 232, 240)
subtitle.TextSize = 12
subtitle.TextWrapped = true
subtitle.Font = Enum.Font.Gotham
subtitle.Parent = frame

local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0.8, 0, 0, 34)
closeBtn.Position = UDim2.new(0.1, 0, 0, 105)
closeBtn.BackgroundColor3 = Color3.fromRGB(34, 197, 94)
closeBtn.Text = "Close Test Window"
closeBtn.TextColor3 = Color3.fromRGB(15, 23, 42)
closeBtn.TextSize = 12
closeBtn.Font = Enum.Font.GothamBold
closeBtn.Parent = frame

local btnCorner = Instance.new("UICorner")
btnCorner.CornerRadius = UDim.new(0, 8)
btnCorner.Parent = closeBtn

closeBtn.MouseButton1Click:Connect(function()
    screenGui:Destroy()
end)

print("[TEST]: UI successfully created on screen!")
